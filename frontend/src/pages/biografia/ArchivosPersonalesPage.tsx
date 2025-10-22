import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { twinApiService } from "@/services/twinApiService";
import { documentApiService, type DocumentInfo } from "@/services/documentApiService";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Upload,
    FolderOpen,
    FileText,
    Download,
    Trash2,
    Eye,
    Search,
    Filter,
    Grid,
    List,
    File,
    FileImage,
    FileVideo,
    Music,
    Archive,
    X,
    Loader2,
    CheckCircle,
    Shield,
    RefreshCw
} from "lucide-react";

interface ArchivoPersonal {
    id: string;
    nombre: string;
    tipo: string;
    tamaño: number;
    fechaSubida: string;
    url: string;
    categoria: string;
    descripcion?: string;
    etiquetas: string[];
    estructura?: string; // Estructurado, semi-estructurado, no-estructurado
    subcategoria?: string; // Subcategoría específica de estructura
    pages?: number; // Número de páginas del documento
    // Metadatos del documento del nuevo endpoint - ACTUALIZADOS con datos ricos
    documentMetadata?: {
        // Campos básicos de metadata
        document_type?: string;
        structure_type?: string;
        sub_category?: string;
        content_type?: string;
        processing_status?: string;
        extracted_text?: string;
        extracted_data?: any;
        tags?: string[];
        created_at?: string;
        updated_at?: string;
        
        // NUEVOS: Datos ricos del backend de análisis de documentos
        documentUrl?: string; // SAS URL para mostrar el documento
        htmlReport?: string; // HTML procesado del documento
        structuredData?: any; // Datos estructurados extraídos (ej: info de factura)
        fullTextContent?: string; // Contenido completo de texto extraído
        tablesContent?: any; // Contenido de tablas extraído
        analysisModel?: string; // Modelo usado para el análisis
        extractedAt?: string; // Fecha de extracción
        uploadedAt?: string; // Fecha de subida
        blobPath?: string; // Ruta del blob
        originalPath?: string; // Ruta original
        fileName?: string; // Nombre real del archivo
        
        // Campos específicos esperados por la UI
        sasUrl?: string; // SAS URL específico para navegación
        AiExecutiveSummaryHtml?: string; // Resumen ejecutivo HTML procesado por IA
        
        // Información específica de la factura (Document Intelligence)
        vendorName?: string;
        vendorNameConfidence?: number;
        customerName?: string;
        customerNameConfidence?: number;
        invoiceNumber?: string;
        invoiceDate?: string;
        dueDate?: string;
        subTotal?: number;
        subTotalConfidence?: number;
        totalTax?: number;
        invoiceTotal?: number;
        invoiceTotalConfidence?: number;
        lineItemsCount?: number;
        tablesCount?: number;
        
        // AI flags
        hasAiExecutiveSummary?: boolean;
        hasAiInvoiceAnalysis?: boolean;
        hasAiCompleteAnalysis?: boolean;
        aiDataFieldsCount?: number;
    };
    // Tipo detectado para filtrado local
    detectedType?: string; // factura, contrato, reporte, certificado, documento
    // Metadatos específicos para documentos no estructurados (nuevos DTOs)
    noStructuredMetadata?: {
        documentID: string;
        twinID: string;
        estructura: string;
        subcategoria: string;
        totalChapters: number;
        totalTokens: number;
        totalPages: number;
        processedAt: string;
        searchScore: number;
    };
}

// Tipos de documentos oficiales soportados
const TIPOS_DOCUMENTOS_OFICIALES = [
    { id: "passport", label: "Pasaporte", icon: "🛂" },
    { id: "id", label: "Documento de Identidad", icon: "🆔" },
    { id: "license", label: "Licencia de Conducir", icon: "🚗" },
    { id: "visa", label: "Visa", icon: "✈️" },
    { id: "birth_certificate", label: "Certificado de Nacimiento", icon: "👶" },
    { id: "marriage_certificate", label: "Certificado de Matrimonio", icon: "💒" },
    { id: "diploma", label: "Diploma/Título", icon: "🎓" },
    { id: "other", label: "Otro", icon: "📋" }
];

// CATEGORIAS_ARCHIVOS eliminado - no se usa actualmente

// Constantes para estructura de documentos
// Tipos de estructura de documentos
const ESTRUCTURA_DOCUMENTOS = {
    ESTRUCTURADO: "estructurado",
    SEMI_ESTRUCTURADO: "semi-estructurado", 
    NO_ESTRUCTURADO: "no-estructurado"
};

// Subcategorías por tipo de estructura
const SUBCATEGORIAS_ESTRUCTURA = {
    [ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO]: [
        { id: "csv", label: "CSV", icon: "📊" },
        { id: "json", label: "JSON", icon: "🔗" },
        { id: "xml", label: "XML", icon: "📝" },
        { id: "database", label: "Base de datos", icon: "🗃️" }
    ],
    [ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO]: [
        { id: "invoice", label: "Facturas", icon: "🧾" },
        { id: "license", label: "Licencias", icon: "📜" },
        { id: "birth_certificate", label: "Certificados de nacimiento", icon: "👶" },
        { id: "account_statement", label: "Estados de cuenta", icon: "💳" },
        { id: "form", label: "Formularios", icon: "📋" }
    ],
    [ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO]: [
        { id: "contract", label: "Contratos", icon: "📄" },
        { id: "cursos", label: "Cursos", icon: "🎓" },
        { id: "report", label: "Reportes", icon: "📊" },
        { id: "email", label: "Emails", icon: "✉️" },
        { id: "letter", label: "Cartas", icon: "💌" },
        { id: "article", label: "Artículos", icon: "📰" },
        { id: "otros", label: "Otros", icon: "📁" }
    ]
};

const ArchivosPersonalesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;
    
    const [archivos, setArchivos] = useState<ArchivoPersonal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [estructuraFiltro, setEstructuraFiltro] = useState<string>("todas");
    const [subcategoriaFiltro, setSubcategoriaFiltro] = useState<string>("todas");
    const [facturaFiltro, setFacturaFiltro] = useState<string>("todas"); // Nuevo filtro para facturas específicas
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [mostrarUpload, setMostrarUpload] = useState(false);
    const [mostrarUploadOficial, setMostrarUploadOficial] = useState(false);
    const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState("passport");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    
    // Estados para validación de documentos no estructurados
    const [tieneIndice, setTieneIndice] = useState<boolean>(false);
    const [totalPaginas, setTotalPaginas] = useState<number>(1);
    const [validationError, setValidationError] = useState<string | null>(null);
    
    // Estados para el orchestrator
    const [isProcessingOrchestrator, setIsProcessingOrchestrator] = useState(false);
    const [orchestratorStatus, setOrchestratorStatus] = useState<string>('');
    const [orchestratorProgress, setOrchestratorProgress] = useState(0);
    
    // Estados para mostrar estadísticas del archivo procesado
    const [mostrarEstadisticasArchivo, setMostrarEstadisticasArchivo] = useState(false);
    const [datosArchivoProcesado, setDatosArchivoProcesado] = useState<any>(null);
    
    // Estados para filtrado local
    const [todosLosArchivos, setTodosLosArchivos] = useState<ArchivoPersonal[]>([]);
    const [filtroTipoDocumento, setFiltroTipoDocumento] = useState<string>("todos");
    const [filtroVendedor, setFiltroVendedor] = useState<string>("todos");
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    // Función para determinar el tipo de documento basado en la subcategoría/nombre
    const getDocumentTypeFromContent = (categoria: string, nombre: string, subcategoria?: string): string => {
        const semiStructuredCategories = [
            'factura', 'facturas', 'invoice', 'invoices',
            'licencia', 'licensias', 'licencias', 'license', 'licenses',
            'contrato', 'contratos', 'contract', 'contracts',
            'recibo', 'recibos', 'receipt', 'receipts',
            'orden', 'ordenes', 'order', 'orders',
            'certificado', 'certificados', 'certificate', 'certificates',
            'diploma', 'diplomas',
            'formulario', 'formularios', 'form', 'forms'
        ];
        
        const categoriaLower = categoria.toLowerCase().trim();
        const nombreLower = nombre.toLowerCase().trim();
        const subcategoriaLower = subcategoria?.toLowerCase().trim() || '';
        
        // Buscar en categoría, nombre y subcategoría
        const textToCheck = `${categoriaLower} ${nombreLower} ${subcategoriaLower}`;
        
        if (semiStructuredCategories.some(cat => textToCheck.includes(cat)) || subcategoria === 'invoice') {
            return ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
        }
        
        // Si no coincide, mantener la clasificación original
        return ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
    };
    // Referencia para controlar solicitudes duplicadas
    const lastRequestRef = useRef<{estructura: string, subcategoria: string, timestamp: number}>({estructura: '', subcategoria: '', timestamp: 0});
    
    // IDs del twin - obtenidos del usuario autenticado
    // Para APIs que requieren el localAccountId como identificador
    const TWIN_ID_DATABASE = msalUser?.localAccountId || "TestTwin2024";  // Fallback para desarrollo
    
    // Para Data Lake storage (contenedor) - usar el twinId INTACTO con guiones
    const TWIN_ID_STORAGE = msalUser?.localAccountId || "testtwin2024";  // Fallback para desarrollo
    
    // Solo log una vez cuando cambie el usuario
    useEffect(() => {
        if (msalUser?.localAccountId) {
            console.log('🆔 Twin IDs utilizados:', {
                database: TWIN_ID_DATABASE,
                storage: TWIN_ID_STORAGE,
                msalUser: msalUser?.localAccountId
            });
        }
    }, [msalUser?.localAccountId]); // Solo cuando cambie el localAccountId

    // Inicialización de filtros desde localStorage si existen y carga inicial de datos
    useEffect(() => {
        // Primero recuperamos los filtros guardados
        const savedEstructura = localStorage.getItem('archivos_filtro_estructura');
        const savedSubcategoria = localStorage.getItem('archivos_filtro_subcategoria');
        const savedFactura = localStorage.getItem('archivos_filtro_factura');
        
        console.log('🔄 Cargando filtros guardados:', { 
            savedEstructura, 
            savedSubcategoria,
            savedFactura,
            estructuraValues: {
                todas: 'todas',
                estructurado: ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO,
                semiEstructurado: ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO,
                noEstructurado: ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO
            }
        });
        
        // Configuramos los filtros antes de cargar los documentos
        if (savedEstructura) {
            console.log(`✅ Aplicando filtro de estructura guardado: ${savedEstructura}`);
            setEstructuraFiltro(savedEstructura);
        }
        
        if (savedSubcategoria) {
            console.log(`✅ Aplicando filtro de subcategoría guardado: ${savedSubcategoria}`);
            setSubcategoriaFiltro(savedSubcategoria);
        }
        
        if (savedFactura) {
            console.log(`✅ Aplicando filtro de factura guardado: ${savedFactura}`);
            setFacturaFiltro(savedFactura);
        }
        
        if (savedFactura) {
            console.log(`✅ Aplicando filtro de factura guardado: ${savedFactura}`);
            setFacturaFiltro(savedFactura);
        }
        
        // Después cargamos los archivos con los filtros ya configurados
        loadArchivos();
    }, []);

    // Forzar la actualización del selector cuando la página esté completamente cargada
    useEffect(() => {
        // Usar un timeout para asegurarnos que la UI esté completamente renderizada
        const timeoutId = setTimeout(() => {
            const savedEstructura = localStorage.getItem('archivos_filtro_estructura');
            const savedSubcategoria = localStorage.getItem('archivos_filtro_subcategoria');
            const savedFactura = localStorage.getItem('archivos_filtro_factura');
            
            console.log('🔍 Estado inicial de los filtros en localStorage:', {
                savedEstructura,
                savedSubcategoria,
                savedFactura
            });
            
            // Solo actualizar si hay valores guardados y los selectores están disponibles
            if (savedEstructura) {
                console.log(`🔄 Aplicando filtro de estructura guardado: ${savedEstructura}`);
                
                // Actualizar directamente el selector de estructura si existe
                const estructuraSelector = document.querySelector('[data-testid="selector-estructura"]') as HTMLSelectElement;
                if (estructuraSelector && estructuraSelector.value !== savedEstructura) {
                    estructuraSelector.value = savedEstructura;
                }
            }
            
            if (savedSubcategoria) {
                console.log(`🔄 Aplicando filtro de subcategoría guardado: ${savedSubcategoria}`);
                
                // Buscar y actualizar el selector si existe
                const subcategoriaSelector = document.querySelector('[data-testid="selector-subcategoria"]') as HTMLSelectElement;
                if (subcategoriaSelector && subcategoriaSelector.value !== savedSubcategoria) {
                    subcategoriaSelector.value = savedSubcategoria;
                }
            }
        }, 500); // Esperar 500ms para asegurarse que todo está renderizado
        
        return () => clearTimeout(timeoutId);
    }, []); // ✅ Sin dependencias para evitar loop

    // UseEffect para recargar documentos cuando cambien los filtros específicos
    useEffect(() => {
        // No hacer nada si ya estamos cargando o si es la carga inicial
        if (isLoading) {
            console.log('🔄 Evitando recarga - ya está cargando');
            return;
        }
        
        // No hacer nada si no hay twin ID
        if (!TWIN_ID_STORAGE) {
            console.log('🔄 Evitando recarga - no hay twin ID');
            return;
        }
        
        // Verificar si es una solicitud duplicada (mismos parámetros dentro de 2 segundos)
        const now = Date.now();
        const lastRequest = lastRequestRef.current;
        if (lastRequest.estructura === estructuraFiltro && 
            lastRequest.subcategoria === subcategoriaFiltro && 
            now - lastRequest.timestamp < 2000) {
            console.log('🔄 Evitando solicitud duplicada de filtros', { estructuraFiltro, subcategoriaFiltro });
            return;
        }
        
        // Actualizar referencia de última solicitud
        lastRequestRef.current = {
            estructura: estructuraFiltro,
            subcategoria: subcategoriaFiltro,
            timestamp: now
        };
        
        // Solo guardar en localStorage si no es la carga inicial
        if (archivos.length > 0) {
            localStorage.setItem('archivos_filtro_estructura', estructuraFiltro);
            localStorage.setItem('archivos_filtro_subcategoria', subcategoriaFiltro);
        }
        
        // SOLO recargar si se ha cargado la página al menos una vez Y los filtros han cambiado realmente
        if (archivos.length > 0 && (lastRequest.estructura !== estructuraFiltro || lastRequest.subcategoria !== subcategoriaFiltro)) {
            // Recargar documentos con el endpoint unificado
            console.log(`🔄 Filtros cambiaron - Estructura: ${estructuraFiltro}, Subcategoría: ${subcategoriaFiltro}`);
            setIsLoading(true);
            
            // Usar el endpoint unificado y filtrar después en el cliente
            loadAllTwinDocuments()
                .finally(() => setIsLoading(false));
        }
    }, [estructuraFiltro, subcategoriaFiltro]);

    const loadArchivos = async () => {
        setIsLoading(true);
        setLoadError(null);
        
        try {
            console.log(`🔄 Cargando todos los documentos usando nuevo endpoint para twin: ${TWIN_ID_STORAGE}`);
            
            // Usar la nueva función unificada que trae todos los documentos con metadatos
            await loadAllTwinDocuments();
            
            console.log('✅ Carga de documentos completada');
            
        } catch (error) {
            console.error('❌ Error al cargar documentos:', error);
            setLoadError('Error al cargar documentos. Verifica que el backend esté funcionando.');
            setArchivos([]);
            setTodosLosArchivos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDocumentosOficiales = async () => {
        try {
            console.log(`📄 Cargando documentos oficiales para twin: ${TWIN_ID_STORAGE}`);
            const response = await documentApiService.listOfficialDocuments(TWIN_ID_STORAGE);
            
            if (response.success) {
                console.log(`✅ Documentos oficiales cargados: ${response.documents.length} documentos`);
                
                // Convertir documentos oficiales al formato ArchivoPersonal para mostrarlos en la lista principal
                const archivosOficiales: ArchivoPersonal[] = response.documents.map((doc, index) => {
                    // Clasificar automáticamente por extensión (ejemplo básico)
                    let estructura = ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                    let subcategoria = "contract";
                    
                    const extension = doc.filename?.split('.').pop()?.toLowerCase();
                    const fileName = doc.filename || 'Documento sin nombre';
                    
                    if (extension === 'csv') {
                        estructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                        subcategoria = "csv";
                    } else if (extension === 'json') {
                        estructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                        subcategoria = "json";
                    } else if (extension === 'pdf') {
                        // Para PDFs, revisar primero el PATH luego el NOMBRE para clasificación precisa
                        const filePath = doc.file_path || '';
                        const fileNameLower = fileName.toLowerCase();
                        
                        console.log(`🔍 CLASIFICANDO PDF: "${fileName}"`, {
                            filePath,
                            fileNameLower,
                            extension,
                            twinIdUsado: TWIN_ID_STORAGE,
                            pathCompleto: filePath
                        });
                        
                        // 1. Clasificación por PATH del Data Lake (más confiable)
                        if (filePath.toLowerCase().includes('semi-estructurado')) {
                            estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            
                            if (filePath.toLowerCase().includes('facturas')) {
                                subcategoria = "invoice";
                            } else if (filePath.toLowerCase().includes('certificados')) {
                                subcategoria = "birth_certificate";
                            } else if (filePath.toLowerCase().includes('licencias')) {
                                subcategoria = "license";
                            } else if (filePath.toLowerCase().includes('estados de cuenta')) {
                                subcategoria = "account_statement";
                            } else if (filePath.toLowerCase().includes('formularios')) {
                                subcategoria = "form";
                            } else {
                                // Fallback para semi-estructurado sin subcarpeta específica
                                subcategoria = "form";
                            }
                        } 
                        // 2. Clasificación por NOMBRE si no hay path específico
                        else if (fileNameLower.includes('factura') || fileNameLower.includes('invoice')) {
                            estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            subcategoria = "invoice";
                        } else if (fileNameLower.includes('acta') || fileNameLower.includes('certificado') || fileNameLower.includes('certificate')) {
                            estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            subcategoria = "birth_certificate";
                        } else if (fileNameLower.includes('licencia') || fileNameLower.includes('license')) {
                            estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            subcategoria = "license";
                        } else if (fileNameLower.includes('estado') || fileNameLower.includes('statement')) {
                            estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            subcategoria = "account_statement";
                        } else if (fileNameLower.includes('formulario') || fileNameLower.includes('form')) {
                            estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            subcategoria = "form";
                        } else {
                            // PDF genérico - mantener como no estructurado
                            estructura = ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                            subcategoria = "contract";
                        }
                        
                        console.log(`✅ PDF CLASIFICADO: "${fileName}" -> ${estructura}/${subcategoria}`);
                    }

                    return {
                        id: `oficial_${index}`,
                        nombre: fileName,
                        tipo: extension || 'unknown',
                        tamaño: doc.size_bytes || 0,
                        fechaSubida: doc.last_modified || new Date().toISOString(),
                        url: doc.file_path || '',
                        categoria: "Documentos oficiales",
                        descripcion: "Documento oficial subido al sistema",
                        etiquetas: ["oficial"],
                        estructura: estructura,
                        subcategoria: subcategoria
                    };
                });
                
                // Agregar los documentos oficiales a la lista principal de archivos
                setArchivos(prev => {
                    // Filtrar documentos oficiales existentes para evitar duplicados
                    const sinOficiales = prev.filter(archivo => archivo.categoria !== "Documentos oficiales");
                    return [...sinOficiales, ...archivosOficiales];
                });
                
            } else {
                console.log('❌ Error al cargar documentos oficiales');
            }
        } catch (error) {
            console.error('❌ Error al cargar documentos oficiales:', error);
        }
    };

    const loadDocumentosEstructurados = async () => {
        try {
            console.log(`📊 Cargando documentos estructurados para twin: ${TWIN_ID_STORAGE}`);
            const response = await documentApiService.listStructuredDocuments(TWIN_ID_STORAGE);
            
            if (response.success) {
                console.log(`✅ Documentos estructurados cargados: ${response.documents.length} documentos`);
                console.log(`📋 Lista completa de documentos estructurados:`, response.documents);
                
                // Convertir documentos estructurados al formato ArchivoPersonal
                const archivosEstructurados: ArchivoPersonal[] = response.documents.map((doc, index) => {
                    const extension = doc.filename?.split('.').pop()?.toLowerCase() || '';
                    
                    // Determinar estructura y subcategoría basándose en la ubicación del archivo
                    let estructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                    let subcategoria = "csv";
                    
                    // Extraer estructura y subcategoría del path si está disponible
                    if (doc.file_path) {
                        const pathParts = doc.file_path.split('/');
                        if (pathParts.length >= 3) {
                            const structurePart = pathParts[1]?.toLowerCase(); // Files/[Estructurado]/...
                            const subCategoryPart = pathParts[2]?.toLowerCase(); // Files/Estructurado/[CSV]/...
                            
                            if (structurePart?.includes('estructurado')) {
                                estructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                            } else if (structurePart?.includes('semi')) {
                                estructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                            } else if (structurePart?.includes('no')) {
                                estructura = ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                            }
                            
                            // Mapear subcategoría desde el path del Data Lake
                            const pathToSubcategory: { [key: string]: string } = {
                                // Nombres en inglés (legacy)
                                'csv': 'csv',
                                'json': 'json', 
                                'xml': 'xml',
                                'invoice': 'invoice',
                                'license': 'license',
                                'birth_certificate': 'birth_certificate',
                                'account_statement': 'account_statement',
                                'form': 'form',
                                'contract': 'contract',
                                'report': 'report',
                                'letter': 'letter',
                                'article': 'article',
                                'email': 'email',
                                // Nombres en español (actual Data Lake)
                                'facturas': 'invoice',
                                'licencias': 'license',
                                'certificados de nacimiento': 'birth_certificate',
                                'estados de cuenta': 'account_statement',
                                'formularios': 'form',
                                'contratos': 'contract',
                                'reportes': 'report',
                                'cartas': 'letter',
                                'artículos': 'article',
                                'emails': 'email'
                            };
                            
                            subcategoria = pathToSubcategory[subCategoryPart.toLowerCase()] || 
                                         (extension === 'csv' ? 'csv' : 'json');
                        }
                    }

                    // Función para obtener la categoría correcta basada en la estructura
                    const getCategoriaByEstructura = (estructura: string) => {
                        switch (estructura) {
                            case ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO:
                                return "Documentos estructurados";
                            case ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO:
                                return "Documentos semi-estructurados";
                            case ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO:
                                return "Documentos no estructurados";
                            default:
                                return "Documentos estructurados"; // fallback
                        }
                    };

                    return {
                        id: `estructurado_${index}`,
                        nombre: doc.filename || 'Documento sin nombre',
                        tipo: extension || 'unknown',
                        tamaño: doc.size_bytes || 0,
                        fechaSubida: doc.last_modified || new Date().toISOString(),
                        url: doc.file_path || '',
                        categoria: getCategoriaByEstructura(estructura),
                        descripcion: `Documento ${extension?.toUpperCase()} de tipo ${estructura.replace('_', '-')}`,
                        etiquetas: ["estructurado", estructura.replace("_", "-")],
                        estructura: estructura,
                        subcategoria: subcategoria
                    };
                });
                
                // Agregar los documentos estructurados a la lista principal de archivos
                setArchivos(prev => {
                    // Filtrar documentos estructurados existentes para evitar duplicados
                    const sinEstructurados = prev.filter(archivo => 
                        !archivo.categoria?.includes("Documentos estructurados") && 
                        !archivo.categoria?.includes("Documentos semi-estructurados") && 
                        !archivo.categoria?.includes("Documentos no estructurados")
                    );
                    return [...sinEstructurados, ...archivosEstructurados];
                });
                
            } else {
                console.log('❌ Error al cargar documentos estructurados');
            }
        } catch (error) {
            console.error('❌ Error al cargar documentos estructurados:', error);
        }
    };

    const loadDocumentosEstructuradosFiltrados = async (estructura: string, subcategoria: string) => {
        try {
            console.log(`🎯 Cargando documentos filtrados - Estructura: ${estructura}, Subcategoría: ${subcategoria}`);
            
            // Mapear estructura del filtro a los valores del backend
            let structureType: string | undefined = undefined;
            let subCategory: string | undefined = undefined;
            
            // Convertir estructura de filtro a formato backend
            if (estructura === ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO) {
                structureType = "Estructurado";
            } else if (estructura === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                structureType = "Semi-estructurado";
            } else if (estructura === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO) {
                structureType = "No-estructurado";
            }
            
            // Convertir subcategoría de filtro a formato backend
            if (subcategoria !== "todas") {
                // Mapear ID de subcategoría a label en español para el backend
                const subcategoriaMapping: { [key: string]: string } = {
                    // Documentos estructurados
                    "csv": "CSV",
                    "json": "JSON",
                    "xml": "XML",
                    "database": "Base de datos",
                    // Documentos semi-estructurados
                    "invoice": "Facturas",
                    "license": "Licencias", 
                    "birth_certificate": "Certificados de nacimiento",
                    "account_statement": "Estados de cuenta",
                    "form": "Formularios",
                    // Documentos no estructurados
                    "contract": "Contratos",
                    "report": "Reportes",
                    "email": "Emails",
                    "letter": "Cartas",
                    "article": "Artículos"
                };
                
                subCategory = subcategoriaMapping[subcategoria] || subcategoria;
            }
            
            console.log(`🌐 Haciendo llamada a la API con parámetros:`, {
                TWIN_ID_STORAGE,
                structureType,
                subCategory,
                originalEstructura: estructura,
                originalSubcategoria: subcategoria
            });
            
            const response = await documentApiService.listStructuredDocuments(TWIN_ID_STORAGE, structureType, subCategory);
            
            console.log(`📊 Respuesta del backend:`, response);
            
            if (response.success) {
                console.log(`✅ Documentos filtrados cargados: ${response.documents.length} documentos`);
                console.log(`📋 Lista de documentos encontrados:`, response.documents);
                
                // Convertir documentos estructurados al formato ArchivoPersonal
                const archivosEstructurados: ArchivoPersonal[] = response.documents.map((doc, index) => {
                    const extension = doc.filename?.split('.').pop()?.toLowerCase() || '';
                    
                    // Determinar estructura y subcategoría basándose en la ubicación del archivo
                    // IMPORTANTE: Usar la estructura del filtro actual en lugar de asumir "estructurado"
                    let docEstructura = estructura; // Usar la estructura pasada como parámetro
                    let docSubcategoria = subcategoria; // Usar la subcategoría pasada como parámetro
                    
                    // Si la subcategoría es "todas", usar valores por defecto según la estructura
                    if (subcategoria === "todas") {
                        if (estructura === ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO) {
                            docSubcategoria = "csv";
                        } else if (estructura === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                            docSubcategoria = "invoice";
                        } else if (estructura === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO) {
                            docSubcategoria = "contract";
                        }
                    }
                    
                    // Extraer estructura y subcategoría del path si está disponible (refinamiento adicional)
                    if (doc.file_path) {
                        const pathParts = doc.file_path.split('/');
                        if (pathParts.length >= 3) {
                            const structurePart = pathParts[1]?.toLowerCase(); // Files/[Estructurado]/...
                            const subCategoryPart = pathParts[2]?.toLowerCase(); // Files/Estructurado/[CSV]/...
                            
                            // Solo actualizar estructura si coincide con el filtro seleccionado
                            if (structurePart?.includes('estructurado')) {
                                // Verificar que coincida con el filtro
                                if (estructura === ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO) {
                                    docEstructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                                }
                            } else if (structurePart?.includes('semi')) {
                                // Verificar que coincida con el filtro
                                if (estructura === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                                    docEstructura = ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                                }
                            } else if (structurePart?.includes('no')) {
                                // Verificar que coincida con el filtro
                                if (estructura === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO) {
                                    docEstructura = ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                                }
                            }
                            
                            // Mapear subcategoría desde el path del Data Lake solo si subcategoría es "todas"
                            if (subcategoria === "todas") {
                                const pathToSubcategory: { [key: string]: string } = {
                                    // Nombres en inglés (legacy)
                                    'csv': 'csv',
                                    'json': 'json', 
                                    'xml': 'xml',
                                    'invoice': 'invoice',
                                    'license': 'license',
                                    'birth_certificate': 'birth_certificate',
                                    'account_statement': 'account_statement',
                                    'form': 'form',
                                    'contract': 'contract',
                                    'report': 'report',
                                    'letter': 'letter',
                                    'article': 'article',
                                    'email': 'email',
                                    // Nombres en español (actual Data Lake)
                                    'facturas': 'invoice',
                                    'licencias': 'license',
                                    'certificados de nacimiento': 'birth_certificate',
                                    'estados de cuenta': 'account_statement',
                                    'formularios': 'form',
                                    'contratos': 'contract',
                                    'reportes': 'report',
                                    'cartas': 'letter',
                                    'artículos': 'article',
                                    'emails': 'email'
                                };
                                
                                const pathSubcategoria = pathToSubcategory[subCategoryPart.toLowerCase()];
                                if (pathSubcategoria) {
                                    docSubcategoria = pathSubcategoria;
                                }
                            }
                        }
                    }

                    console.log(`🏗️ CREANDO ARCHIVO FILTRADO: "${doc.filename}" con estructura="${docEstructura}" y subcategoria="${docSubcategoria}"`, {
                        filtroEstructura: estructura,
                        filtroSubcategoria: subcategoria,
                        docResultante: { estructura: docEstructura, subcategoria: docSubcategoria },
                        archivo: doc
                    });

                    // Función para obtener la categoría correcta basada en la estructura
                    const getCategoriaByEstructura = (estructura: string) => {
                        switch (estructura) {
                            case ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO:
                                return "Documentos estructurados";
                            case ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO:
                                return "Documentos semi-estructurados";
                            case ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO:
                                return "Documentos no estructurados";
                            default:
                                return "Documentos estructurados"; // fallback
                        }
                    };

                    return {
                        id: doc.id || doc.filename || `estructurado_filtrado_${index}`, // Usar el ID real del documento primero
                        nombre: doc.filename || 'Documento sin nombre',
                        tipo: extension || 'unknown',
                        tamaño: doc.size_bytes || 0,
                        fechaSubida: doc.last_modified || new Date().toISOString(),
                        url: doc.file_path || '',
                        categoria: getCategoriaByEstructura(docEstructura),
                        descripcion: `Documento ${docSubcategoria.toUpperCase()} de tipo ${docEstructura.replace('_', '-')}`,
                        etiquetas: ["estructurado", docEstructura.replace("_", "-"), docSubcategoria],
                        estructura: docEstructura,
                        subcategoria: docSubcategoria
                    };
                });
                
                // Reemplazar documentos estructurados con los filtrados
                setArchivos(prev => {
                    // Filtrar documentos estructurados existentes
                    const sinEstructurados = prev.filter(archivo => 
                        !archivo.categoria?.includes("Documentos estructurados") && 
                        !archivo.categoria?.includes("Documentos semi-estructurados") && 
                        !archivo.categoria?.includes("Documentos no estructurados")
                    );
                    return [...sinEstructurados, ...archivosEstructurados];
                });
                
            } else {
                console.log('❌ Error al cargar documentos estructurados filtrados');
                // Si no hay documentos con el filtro específico, limpiar los estructurados
                setArchivos(prev => prev.filter(archivo => 
                    !archivo.categoria?.includes("Documentos estructurados") && 
                    !archivo.categoria?.includes("Documentos semi-estructurados") && 
                    !archivo.categoria?.includes("Documentos no estructurados")
                ));
            }
        } catch (error) {
            console.error('❌ Error al cargar documentos estructurados filtrados:', error);
            // En caso de error, limpiar los documentos estructurados
            setArchivos(prev => prev.filter(archivo => 
                !archivo.categoria?.includes("Documentos estructurados") && 
                !archivo.categoria?.includes("Documentos semi-estructurados") && 
                !archivo.categoria?.includes("Documentos no estructurados")
            ));
        }
    };

    /**
     * Nueva función unificada para cargar todos los documentos usando el endpoint list-documents
     * con metadatos y filtrado directo en el backend cuando sea posible
     */
    const loadAllTwinDocuments = async () => {
        try {
            console.log(`📄 Cargando documentos para twin: ${TWIN_ID_STORAGE}`, { 
                estructuraFiltro, 
                subcategoriaFiltro 
            });
            
            // Usar filtrado directo en el backend cuando ambos filtros están activos y no son "todas"
            let documents: DocumentInfo[] = [];
            
            // Para documentos no estructurados, usar el endpoint de metadatos optimizado
            if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO) {
                console.log(`🎯 Usando endpoint de metadatos para documentos no estructurados`);
                try {
                    const metadataResult = await documentApiService.searchNoStructuredDocumentsMetadata(
                        TWIN_ID_STORAGE, 
                        'no-estructurado'
                    );
                    
                    if (metadataResult.success && metadataResult.documents) {
                        // Convertir los metadatos a DocumentInfo para compatibilidad
                        documents = metadataResult.documents.map(doc => ({
                            id: doc.documentID,
                            filename: `Documento ${doc.documentID}.pdf`, // Usar ID como nombre por ahora
                            file_path: `twin-${doc.twinID}/${doc.estructura}/${doc.subcategoria}`,
                            public_url: '', // No disponible en metadatos
                            size_bytes: 0, // No disponible en metadatos
                            document_type: doc.subcategoria,
                            structure_type: doc.estructura,
                            sub_category: doc.subcategoria,
                            pages: doc.totalPages,
                            last_modified: doc.processedAt,
                            // Metadatos específicos de los nuevos DTOs para identificar documentos no estructurados
                            noStructuredMetadata: {
                                documentID: doc.documentID,
                                twinID: doc.twinID,
                                estructura: doc.estructura,
                                subcategoria: doc.subcategoria,
                                totalChapters: doc.totalChapters,
                                totalTokens: doc.totalTokens,
                                totalPages: doc.totalPages,
                                processedAt: doc.processedAt,
                                searchScore: doc.searchScore
                            }
                        }));
                        
                        console.log(`✅ Documentos no estructurados obtenidos: ${documents.length} documentos`);
                    } else {
                        console.warn('⚠️ No se obtuvieron documentos del endpoint de metadatos:', metadataResult.error);
                        documents = [];
                    }
                } catch (error) {
                    console.error('❌ Error al obtener metadatos de documentos no estructurados:', error);
                    // Fallback al método original
                    documents = await documentApiService.getAllTwinDocuments(TWIN_ID_STORAGE);
                }
            } else if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                console.log(`🎯 Usando filtrado directo en backend: ${estructuraFiltro}/${subcategoriaFiltro}`);
                documents = await documentApiService.getAllTwinDocuments(
                    TWIN_ID_STORAGE, 
                    estructuraFiltro, 
                    subcategoriaFiltro
                );
            } else {
                console.log(`📋 Obteniendo todos los documentos (filtrado local si es necesario)`);
                documents = await documentApiService.getAllTwinDocuments(TWIN_ID_STORAGE);
            }
            
            console.log(`✅ Documentos obtenidos: ${documents.length} documentos`);
            
            // Función auxiliar para obtener categoría por metadatos
            const getCategoriaByMetadata = (metadata: any) => {
                if (!metadata) return "📄 Documentos";
                
                const docType = metadata.document_type?.toLowerCase() || '';
                const structureType = metadata.structure_type?.toLowerCase() || '';
                const subCategory = metadata.sub_category?.toLowerCase() || '';
                
                // Determinar categoría basada en metadatos
                if (docType.includes('invoice') || docType.includes('factura') || subCategory.includes('invoice')) {
                    return "💰 Facturas";
                } else if (docType.includes('contract') || docType.includes('contrato') || subCategory.includes('contract')) {
                    return "📋 Contratos";
                } else if (docType.includes('report') || docType.includes('reporte') || subCategory.includes('report')) {
                    return "📊 Reportes";
                } else if (docType.includes('certificate') || docType.includes('certificado') || subCategory.includes('certificate')) {
                    return "🏆 Certificados";
                } else if (structureType.includes('structured') || structureType.includes('estructurado')) {
                    return "📄 Documentos estructurados";
                } else if (structureType.includes('semi') || structureType.includes('semi-estructurado')) {
                    return "📄 Documentos semi-estructurados";
                } else if (structureType.includes('unstructured') || structureType.includes('no-estructurado')) {
                    return "📄 Documentos no estructurados";
                } else {
                    return "📄 Documentos";
                }
            };
            
            // Función para obtener estructura basada en metadatos
            const getEstructuraByMetadata = (metadata: any) => {
                if (!metadata) return ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                
                const structureType = (metadata.structure_type || '').toLowerCase();
                console.log(`🔍 Analyzing structure_type: "${structureType}" for document`);
                
                // IMPORTANTE: Verificar 'semi' ANTES que 'structured' porque 'semi-structured' contiene ambos
                if (structureType.includes('semi')) {
                    return ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                } else if (structureType.includes('structured') || structureType.includes('estructurado')) {
                    return ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                } else if (structureType.includes('unstructured') || structureType.includes('no-estructurado')) {
                    return ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                } else {
                    // Default fallback based on document type if structure_type is not clear
                    const docType = (metadata.document_type || '').toLowerCase();
                    if (docType.includes('invoice') || docType.includes('factura')) {
                        return ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                    } else if (docType.includes('contract') || docType.includes('contrato')) {
                        return ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                    } else {
                        return ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                    }
                }
            };
            
            // Función para obtener tipo detectado por metadatos
            const getDetectedTypeByMetadata = (metadata: any) => {
                if (!metadata) return 'documento';
                
                const docType = (metadata.document_type || '').toLowerCase();
                const subCategory = (metadata.sub_category || '').toLowerCase();
                
                console.log(`🔍 Analyzing document type: "${docType}" and sub_category: "${subCategory}"`);
                
                if (docType.includes('invoice') || docType.includes('factura') || subCategory.includes('invoice') || subCategory.includes('factura')) {
                    return 'factura';
                } else if (docType.includes('contract') || docType.includes('contrato') || subCategory.includes('contract') || subCategory.includes('contrato')) {
                    return 'contrato';
                } else if (docType.includes('report') || docType.includes('reporte') || subCategory.includes('report') || subCategory.includes('reporte')) {
                    return 'reporte';
                } else if (docType.includes('certificate') || docType.includes('certificado') || subCategory.includes('certificate') || subCategory.includes('certificado')) {
                    return 'certificado';
                } else {
                    return 'documento';
                }
            };
            
            if (documents.length > 0) {
                // Convertir documentos del API al formato ArchivoPersonal usando metadatos
                const archivosUnificados: ArchivoPersonal[] = documents.map((doc, index) => {
                    const metadata = doc.metadata;
                    
                    console.log(`🔍 Processing document ${index + 1}:`, {
                        originalDoc: doc,
                        filename: doc.filename,
                        documentId: doc.id, // ¡NUEVO: LOG del ID real del documento!
                        metadata: metadata,
                        metadataKeys: metadata ? Object.keys(metadata) : 'NO_METADATA'
                    });
                    
                    const estructura = getEstructuraByMetadata(metadata);
                    const detectedType = getDetectedTypeByMetadata(metadata);
                    
                    console.log(`🔍 Processed values for ${doc.filename}:`, {
                        estructura,
                        detectedType,
                        subcategoria: metadata?.sub_category || metadata?.document_type || detectedType
                    });
                    
                    // Determinar extensión basada en content_type o filename
                    let extension = 'unknown';
                    if (metadata?.content_type) {
                        // Mapear content types a extensiones
                        if (metadata.content_type.includes('pdf')) extension = 'pdf';
                        else if (metadata.content_type.includes('image')) extension = 'img';
                        else if (metadata.content_type.includes('text')) extension = 'txt';
                        else if (metadata.content_type.includes('word')) extension = 'docx';
                        else if (metadata.content_type.includes('excel')) extension = 'xlsx';
                    } else if (doc.filename) {
                        extension = doc.filename.split('.').pop()?.toLowerCase() || 'unknown';
                    }
                    
                    return {
                        id: doc.id || doc.filename || `doc-${index + 1}`, // Usar el ID real del documento primero
                        nombre: doc.filename ? doc.filename.split('/').pop() || doc.filename : `Documento ${index + 1}`, // ✅ EXTRAER SOLO EL NOMBRE DEL ARCHIVO
                        tipo: extension,
                        tamaño: doc.size_bytes || (metadata?.extracted_text?.length || 0),
                        fechaSubida: doc.last_modified || metadata?.created_at || new Date().toISOString(),
                        url: doc.public_url || doc.file_path || '',
                        categoria: getCategoriaByMetadata(metadata),
                        descripcion: metadata?.extracted_text?.substring(0, 200) || `Documento ${metadata?.document_type || detectedType}`,
                        etiquetas: [
                            estructura.replace('_', '-'),
                            metadata?.document_type,
                            metadata?.sub_category,
                            detectedType,
                            ...( metadata?.tags || [])
                        ].filter((tag): tag is string => Boolean(tag)),
                        estructura: estructura,
                        subcategoria: metadata?.sub_category || metadata?.document_type || detectedType,
                        pages: doc.pages || 1, // Agregar número de páginas
                        // Metadatos del documento
                        documentMetadata: metadata,
                        // Tipo detectado para filtrado local
                        detectedType: detectedType
                    };
                });
                
                console.log(`🔄 Actualizando estado con ${archivosUnificados.length} documentos con metadatos`);
                
                // DEBUG: Analizar los tipos de documentos que tenemos
                console.log(`📊 ANÁLISIS DE DATOS CARGADOS:`);
                console.log(`Total de documentos: ${archivosUnificados.length}`);
                
                const tiposDetectados = archivosUnificados.map(doc => doc.detectedType).filter(Boolean);
                const estructuras = archivosUnificados.map(doc => doc.estructura).filter(Boolean);
                const subcategorias = archivosUnificados.map(doc => doc.subcategoria).filter(Boolean);
                const categorias = archivosUnificados.map(doc => doc.categoria).filter(Boolean);
                
                console.log(`📋 Tipos detectados únicos:`, [...new Set(tiposDetectados)]);
                console.log(`🏗️ Estructuras únicas:`, [...new Set(estructuras)]);
                console.log(`📑 Subcategorías únicas:`, [...new Set(subcategorias)]);
                console.log(`📁 Categorías únicas:`, [...new Set(categorias)]);
                
                // Buscar específicamente facturas
                const posiblesFacturas = archivosUnificados.filter(doc => 
                    doc.detectedType === "factura" ||
                    doc.categoria?.includes("Factura") ||
                    doc.subcategoria === "invoice" ||
                    doc.etiquetas?.some(e => e.includes('factura') || e.includes('invoice')) ||
                    doc.nombre?.toLowerCase().includes('factura') ||
                    doc.nombre?.toLowerCase().includes('invoice')
                );
                
                console.log(`💰 Posibles facturas encontradas: ${posiblesFacturas.length}`);
                if (posiblesFacturas.length > 0) {
                    console.log(`💰 Detalles de facturas:`, posiblesFacturas.map(f => ({
                        nombre: f.nombre,
                        detectedType: f.detectedType,
                        categoria: f.categoria,
                        subcategoria: f.subcategoria,
                        estructura: f.estructura,
                        etiquetas: f.etiquetas
                    })));
                }
                
                // Guardamos todos los documentos
                setTodosLosArchivos(archivosUnificados);
                setArchivos(archivosUnificados);
                
            } else {
                console.log('📋 No se encontraron documentos');
                setTodosLosArchivos([]);
                setArchivos([]);
            }
            
        } catch (error) {
            console.error('❌ Error al cargar documentos del twin:', error);
            setTodosLosArchivos([]);
            setArchivos([]);
        }
    };

    /**
     * Función para aplicar filtros locales a los documentos cargados
     */
    const aplicarFiltrosLocales = () => {
        let archivosFiltrados = [...todosLosArchivos];
        
        console.log(`🚀 INICIO filtrado - Total archivos: ${todosLosArchivos.length}`);
        console.log(`📋 Estado de filtros:`, {
            filtroTipoDocumento,
            estructuraFiltro,
            subcategoriaFiltro,
            filtroVendedor
        });
        
        // Si hay filtros de estructura/subcategoría activos, darles prioridad sobre el filtro de tipo de documento
        const usingStructureFilters = estructuraFiltro !== "todas" || subcategoriaFiltro !== "todas";
        console.log(`🔧 Usando filtros de estructura: ${usingStructureFilters}`);
        
        // Filtrar por tipo de documento detectado (solo si no hay filtros de estructura activos)
        if (filtroTipoDocumento !== "todos" && !usingStructureFilters) {
            console.log(`🔍 Aplicando filtro de tipo de documento: ${filtroTipoDocumento}`);
            const antesTipo = archivosFiltrados.length;
            
            archivosFiltrados = archivosFiltrados.filter(archivo => {
                // Lógica más permisiva para facturas
                if (filtroTipoDocumento === "factura") {
                    const matches = archivo.detectedType === "factura" ||
                                   archivo.categoria?.includes("Factura") ||
                                   archivo.subcategoria === "invoice" ||
                                   archivo.etiquetas?.some(e => e.includes('factura') || e.includes('invoice')) ||
                                   archivo.nombre?.toLowerCase().includes('factura') ||
                                   archivo.nombre?.toLowerCase().includes('invoice');
                    
                    console.log(`💰 Archivo ${archivo.nombre} - match para facturas: ${matches}`, {
                        detectedType: archivo.detectedType,
                        categoria: archivo.categoria,
                        subcategoria: archivo.subcategoria,
                        etiquetas: archivo.etiquetas,
                        nombreContieneFacura: archivo.nombre?.toLowerCase().includes('factura')
                    });
                    
                    return matches;
                }
                // Lógica más permisiva para contratos
                else if (filtroTipoDocumento === "contrato") {
                    return archivo.detectedType === "contrato" ||
                           archivo.categoria?.includes("Contrato") ||
                           archivo.subcategoria === "contract" ||
                           archivo.etiquetas?.some(e => e.includes('contrato') || e.includes('contract')) ||
                           archivo.nombre?.toLowerCase().includes('contrato') ||
                           archivo.nombre?.toLowerCase().includes('contract');
                }
                // Lógica más permisiva para reportes
                else if (filtroTipoDocumento === "reporte") {
                    return archivo.detectedType === "reporte" ||
                           archivo.categoria?.includes("Reporte") ||
                           archivo.subcategoria === "report" ||
                           archivo.etiquetas?.some(e => e.includes('reporte') || e.includes('report')) ||
                           archivo.nombre?.toLowerCase().includes('reporte') ||
                           archivo.nombre?.toLowerCase().includes('report');
                }
                // Para otros tipos, usar la lógica estricta
                else {
                    return archivo.detectedType === filtroTipoDocumento;
                }
            });
            
            console.log(`📊 Después del filtro de tipo: ${archivosFiltrados.length} de ${antesTipo} archivos`);
        }
        
        // Filtrar por vendedor (solo para facturas)
        if (filtroVendedor !== "todos" && (filtroTipoDocumento === "factura" || subcategoriaFiltro === "invoice")) {
            archivosFiltrados = archivosFiltrados.filter(archivo => {
                const structuredData = archivo.documentMetadata?.structuredData;
                const vendorName = structuredData?.vendor?.name;
                return vendorName === filtroVendedor;
            });
        }
        
        // Filtrar por estructura (si se usa)
        if (estructuraFiltro !== "todas") {
            console.log(`🏗️ Aplicando filtro de estructura: ${estructuraFiltro}`);
            const antesEstructura = archivosFiltrados.length;
            
            archivosFiltrados = archivosFiltrados.filter(archivo => {
                const matches = archivo.estructura === estructuraFiltro;
                console.log(`📄 Archivo ${archivo.nombre} - estructura: ${archivo.estructura}, matches: ${matches}`);
                return matches;
            });
            
            console.log(`📊 Después del filtro de estructura: ${archivosFiltrados.length} de ${antesEstructura} archivos`);
        }
        
        // Filtrar por subcategoría (si se usa) - Lógica mejorada para facturas
        if (subcategoriaFiltro !== "todas") {
            console.log(`🔍 Aplicando filtro de subcategoría: ${subcategoriaFiltro}`);
            
            archivosFiltrados = archivosFiltrados.filter(archivo => {
                // Log detallado para cada archivo
                console.log(`📄 Evaluando archivo: ${archivo.nombre}`, {
                    subcategoria: archivo.subcategoria,
                    detectedType: archivo.detectedType,
                    categoria: archivo.categoria,
                    etiquetas: archivo.etiquetas
                });
                
                // Si la subcategoría es "invoice" (Facturas), incluir también documentos con detectedType "factura"
                if (subcategoriaFiltro === "invoice") {
                    const matches = archivo.subcategoria === subcategoriaFiltro || 
                                   archivo.detectedType === "factura" ||
                                   archivo.categoria.includes('Facturas') ||
                                   archivo.etiquetas.some(e => e.includes('factura') || e.includes('invoice'));
                    
                    console.log(`💰 Archivo ${archivo.nombre} - match para facturas: ${matches}`, {
                        subcategoriaMatch: archivo.subcategoria === subcategoriaFiltro,
                        detectedTypeMatch: archivo.detectedType === "factura",
                        categoriaMatch: archivo.categoria.includes('Facturas'),
                        etiquetasMatch: archivo.etiquetas.some(e => e.includes('factura') || e.includes('invoice'))
                    });
                    
                    return matches;
                }
                // Si la subcategoría es "contract" (Contratos), incluir también documentos con detectedType "contrato"
                else if (subcategoriaFiltro === "contract") {
                    return archivo.subcategoria === subcategoriaFiltro || 
                           archivo.detectedType === "contrato" ||
                           archivo.categoria.includes('Contratos') ||
                           archivo.etiquetas.some(e => e.includes('contrato') || e.includes('contract'));
                }
                // Si la subcategoría es "report" (Reportes), incluir también documentos con detectedType "reporte"
                else if (subcategoriaFiltro === "report") {
                    return archivo.subcategoria === subcategoriaFiltro || 
                           archivo.detectedType === "reporte" ||
                           archivo.categoria.includes('Reportes') ||
                           archivo.etiquetas.some(e => e.includes('reporte') || e.includes('report'));
                }
                // Para otras subcategorías, usar la lógica normal
                else {
                    const matches = archivo.subcategoria === subcategoriaFiltro;
                    console.log(`📋 Archivo ${archivo.nombre} - match para subcategoría ${subcategoriaFiltro}: ${matches}`);
                    return matches;
                }
            });
            
            console.log(`📊 Después del filtro de subcategoría: ${archivosFiltrados.length} archivos`);
        }
        
        // Filtrar por factura específica si está seleccionado
        if (facturaFiltro !== "todas" && estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO && subcategoriaFiltro === 'invoice') {
            const antesFactura = archivosFiltrados.length;
            archivosFiltrados = archivosFiltrados.filter(archivo => archivo.id === facturaFiltro);
            console.log(`� Después del filtro de factura específica: ${archivosFiltrados.length} de ${antesFactura} archivos`);
        }
        
        console.log(`�🔍 Filtros aplicados: tipo=${filtroTipoDocumento}, vendedor=${filtroVendedor}, estructura=${estructuraFiltro}, subcategoria=${subcategoriaFiltro}, factura=${facturaFiltro}, usingStructureFilters=${usingStructureFilters}`);
        console.log(`📋 Documentos después del filtrado: ${archivosFiltrados.length} de ${todosLosArchivos.length}`);
        
        // Debug: mostrar los documentos que se están filtrando
        if (todosLosArchivos.length > 0 && archivosFiltrados.length === 0) {
            console.log(`🚨 DEBUG: Todos los documentos fueron filtrados. Detalles:`);
            todosLosArchivos.forEach(doc => {
                console.log(`📄 Documento:`, {
                    nombre: doc.nombre,
                    estructura: doc.estructura,
                    subcategoria: doc.subcategoria,
                    detectedType: doc.detectedType,
                    filtros: {
                        estructuraFiltro,
                        subcategoriaFiltro,
                        filtroTipoDocumento,
                        filtroVendedor
                    },
                    matches: {
                        estructuraMatch: doc.estructura === estructuraFiltro,
                        subcategoriaMatch: doc.subcategoria === subcategoriaFiltro,
                        tipoMatch: filtroTipoDocumento === "todos" || doc.detectedType === filtroTipoDocumento,
                        vendedorMatch: filtroVendedor === "todos" || (doc.documentMetadata?.structuredData?.vendor?.name === filtroVendedor)
                    }
                });
            });
        }
        setArchivos(archivosFiltrados);
    };
    
    // Función para obtener lista de facturas disponibles para el combo de facturas
    const obtenerFacturasDisponibles = () => {
        if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO && subcategoriaFiltro === 'invoice') {
            return archivos.filter(archivo => {
                // Filtrar solo facturas/invoices con vendor information
                const structuredData = archivo.documentMetadata?.structuredData;
                const vendorName = structuredData?.vendor?.name;
                const isInvoice = vendorName && (
                    archivo.subcategoria === 'invoice' ||
                    archivo.subcategoria === 'invoice' ||
                    archivo.nombre?.toLowerCase().includes('invoice') ||
                    archivo.nombre?.toLowerCase().includes('factura') ||
                    archivo.categoria?.toLowerCase().includes('factura') ||
                    archivo.categoria?.toLowerCase().includes('invoice')
                );
                return isInvoice;
            }).map(archivo => ({
                id: archivo.id,
                nombre: archivo.nombre,
                vendor: archivo.documentMetadata?.structuredData?.vendor?.name || 'Sin vendor',
                displayName: `${archivo.documentMetadata?.structuredData?.vendor?.name || 'Sin vendor'} - ${archivo.nombre}`
            }));
        }
        return [];
    };
    
    // Función para obtener la lista única de vendedores de las facturas
    const obtenerVendedoresUnicos = () => {
        const facturas = todosLosArchivos.filter(archivo => archivo.detectedType === 'factura');
        const vendedores = new Set<string>();
        
        facturas.forEach(factura => {
            const structuredData = factura.documentMetadata?.structuredData;
            const vendorName = structuredData?.vendor?.name;
            if (vendorName && vendorName.trim()) {
                vendedores.add(vendorName.trim());
            }
        });
        
        return Array.from(vendedores).sort();
    };

    // useEffect para aplicar filtros cuando cambien los filtros o los documentos
    useEffect(() => {
        // Evitar aplicar filtros si estamos cargando documentos
        if (isLoading) {
            console.log('🔄 Evitando aplicación de filtros - carga en progreso');
            return;
        }
        
        if (todosLosArchivos.length > 0) {
            aplicarFiltrosLocales();
        }
    }, [filtroTipoDocumento, estructuraFiltro, subcategoriaFiltro, facturaFiltro, filtroVendedor, todosLosArchivos]);

    // Función para abrir el visor de archivos
    const handleViewFile = (archivo: ArchivoPersonal) => {
        console.log('🔍 Navegando a página de detalles para archivo:', archivo.nombre);
        
        const encodedFilename = encodeURIComponent(archivo.nombre);
        
        // Determinar el tipo de archivo por extensión
        const fileExtension = archivo.nombre.toLowerCase().split('.').pop();
        
        if (fileExtension === 'csv') {
            // Para archivos CSV, navegar a CSVViewerPage
            console.log('📊 Archivo CSV detectado, navegando a CSVViewerPage');
            navigate(`/twin-biografia/csv-viewer/${encodedFilename}`);
        } else {
            // Para otros archivos (PDF, imágenes, etc.), navegar a ArchivoDetalles
            // PASAR LOS DATOS RICOS que ya tenemos en lugar de hacer otra llamada al backend
            console.log('📄 Archivo no-CSV detectado, navegando a ArchivoDetalles con datos ricos');
            console.log('🔍 Datos ricos disponibles:', {
                hasDocumentMetadata: !!archivo.documentMetadata,
                // Buscar la SAS URL en los metadatos directos (no anidados)
                sasUrl: archivo.documentMetadata?.documentUrl,
                htmlReport: archivo.documentMetadata?.htmlReport,
                structuredData: archivo.documentMetadata?.structuredData,
                fullTextContent: archivo.documentMetadata?.fullTextContent,
                // Debug completo de los metadatos
                metadataStructure: archivo.documentMetadata
            });

            // Verificar que tenemos datos HTML para pasar
            const hasHtmlReport = !!archivo.documentMetadata?.htmlReport;
            const htmlReportLength = archivo.documentMetadata?.htmlReport?.length || 0;
            console.log('📊 Estado de HTML Report:', {
                hasHtmlReport,
                htmlReportLength,
                htmlPreview: archivo.documentMetadata?.htmlReport?.substring(0, 100) + '...'
            });
            
            // Pasar los datos ricos via state para evitar hacer otra llamada al backend
            navigate(`/twin-biografia/archivos-personales/${encodedFilename}`, {
                state: {
                    // Datos del archivo en el formato que espera ArchivoDetalles.tsx
                    archivo: {
                        id: archivo.id,
                        filename: archivo.nombre,
                        tipo: archivo.tipo,
                        tamano: archivo.tamaño?.toString() || "0", // Corregir typo y convertir a string
                        categoria: archivo.categoria,
                        fechaSubida: archivo.fechaSubida,
                        path: archivo.documentMetadata?.documentUrl || archivo.url,
                        sasUrl: archivo.documentMetadata?.sasUrl,
                        AiExecutiveSummaryHtml: archivo.documentMetadata?.AiExecutiveSummaryHtml,
                        metadata: {
                            ...archivo.documentMetadata,
                            sasUrl: archivo.documentMetadata?.sasUrl
                        }
                    },
                    twinId: TWIN_ID_STORAGE, // Usar la constante correcta
                    // Datos ricos en el formato que espera ArchivoDetalles.tsx
                    richDocumentData: {
                        htmlReport: archivo.documentMetadata?.htmlReport,
                        structuredData: archivo.documentMetadata?.structuredData,
                        fullTextContent: archivo.documentMetadata?.fullTextContent,
                        tablesContent: archivo.documentMetadata?.tablesContent
                    }
                }
            });
        }
    };

    // Función para cerrar el modal de upload con estados limpios
    const handleCloseUploadModal = () => {
        resetUploadModalStates();
        setMostrarUploadOficial(false);
    };

    // Función para resetear estados del modal de upload
    const resetUploadModalStates = () => {
        setUploadSuccess(false);
        setUploadProgress(0);
        setIsUploading(false);
        setIsProcessingOrchestrator(false);
        setOrchestratorStatus('');
        setOrchestratorProgress(0);
        // Reset file input
        if (documentInputRef.current) {
            documentInputRef.current.value = '';
        }
        // Reset validation fields for no-structured documents
        setTieneIndice(false);
        setTotalPaginas(1);
        setValidationError(null);
    };

    // Función para abrir el modal de upload con estados limpios
    const handleOpenUploadModal = () => {
        resetUploadModalStates();
        setMostrarUploadOficial(true);
    };

    // Función para cerrar el modal de estadísticas del archivo procesado
    const handleCloseEstadisticasModal = () => {
        setMostrarEstadisticasArchivo(false);
        setDatosArchivoProcesado(null);
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDocumentUpload = () => {
        documentInputRef.current?.click();
    };

    const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('El archivo no puede ser mayor a 10MB');
            return;
        }

        // Validar tipo de archivo según estructura seleccionada
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
            // Validación específica para documentos estructurados
            const allowedTypesStructured: { [key: string]: string[] } = {
                // Documentos estructurados
                'csv': ['.csv'],
                'json': ['.json'],
                'xml': ['.xml'],
                'database': ['.db', '.sqlite', '.sql'],
                // Documentos semi-estructurados - SOLO PDF para mejor procesamiento con IA
                'invoice': ['.pdf'],
                'license': ['.pdf'],
                'birth_certificate': ['.pdf'],
                'account_statement': ['.pdf'],
                'form': ['.pdf'],
                // Documentos no-estructurados
                'contract': ['.pdf', '.doc', '.docx'],
                'report': ['.pdf', '.doc', '.docx'],
                'email': ['.eml', '.msg', '.pdf'],
                'letter': ['.pdf', '.doc', '.docx'],
                'article': ['.pdf', '.doc', '.docx', '.txt']
            };
            
            const allowedForSubcategory = allowedTypesStructured[subcategoriaFiltro] || ['.pdf'];
            
            if (!allowedForSubcategory.includes(fileExtension)) {
                // Mensaje específico para documentos semi-estructurados
                if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                    alert(`⚠️ Para documentos semi-estructurados como facturas y certificados, solo se permiten archivos PDF.\n\nEsto garantiza un mejor procesamiento con Azure AI Document Intelligence.\n\nTipo detectado: ${fileExtension}\nRequerido: PDF`);
                } else {
                    alert(`Tipo de archivo no permitido para ${subcategoriaFiltro}. Tipos permitidos: ${allowedForSubcategory.join(', ')}`);
                }
                return;
            }
            
            // Mensaje informativo para documentos semi-estructurados
            if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                console.log(`✅ Archivo PDF válido para documento semi-estructurado: ${subcategoriaFiltro}`);
            }
        } else {
            // Validación original para documentos oficiales
            const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
            
            if (!allowedTypes.includes(fileExtension)) {
                alert(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
                return;
            }
        }

        // Validación adicional para documentos no estructurados
        if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO && subcategoriaFiltro !== "todas") {
            // Validar si requiere índice
            if (!tieneIndice && totalPaginas > 30) {
                setValidationError('Los documentos de más de 30 páginas requieren un índice');
                alert('⚠️ Documento no válido\n\nLos documentos de más de 30 páginas sin índice no pueden ser procesados.\nPor favor, agregue un índice o tabla de contenidos al documento antes de subirlo.');
                return;
            }
            console.log(`✅ Validación de documento no estructurado exitosa: Páginas=${totalPaginas}, Tiene índice=${tieneIndice}`);
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simular progreso de subida
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Subir documento al Data Lake usando el método apropiado
            let response;
            
            // Si se seleccionó una estructura específica, usar upload estructurado
            if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                console.log(`📊 Subiendo documento estructurado: ${estructuraFiltro}/${subcategoriaFiltro}`);
                
                // Mapear el ID de subcategoría al label que usa el Data Lake
                const subcategoriaToLabel: { [key: string]: string } = {
                    // Documentos estructurados
                    "csv": "CSV",
                    "json": "JSON",
                    "xml": "XML",
                    "database": "Base de datos",
                    // Documentos semi-estructurados
                    "invoice": "Facturas",
                    "license": "Licencias", 
                    "birth_certificate": "Certificados de nacimiento",
                    "account_statement": "Estados de cuenta",
                    "form": "Formularios",
                    // Documentos no estructurados
                    "contract": "Contratos",
                    "report": "Reportes",
                    "email": "Emails",
                    "letter": "Cartas",
                    "article": "Artículos"
                };
                
                const subcategoriaLabel = subcategoriaToLabel[subcategoriaFiltro] || subcategoriaFiltro;
                console.log(`📂 Enviando al backend - Estructura: ${estructuraFiltro}, Subcategoría: ${subcategoriaLabel} (original: ${subcategoriaFiltro})`);
                
                // Obtener el label en español para usar en el directorio
                const subcategoriaObj = SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro);
                const subcategoriaParaDirectorio = subcategoriaObj?.label || subcategoriaLabel;
                
                // Para documentos semi-estructurados, usar el orchestrator
                if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                    console.log(`📄 Subiendo documento semi-estructurado SIN orchestrator: ${subcategoriaLabel}`);
                    console.log(`🔍 Valores para upload directo:`, {
                        twinId: TWIN_ID_STORAGE,
                        fileName: file.name,
                        fileSize: file.size,
                        subCategory: subcategoriaParaDirectorio,
                        estructura: estructuraFiltro
                    });
                    
                    // TEMPORALMENTE: Usar upload directo en lugar de orchestrator
                    response = await documentApiService.uploadStructuredDocument(
                        TWIN_ID_STORAGE,
                        file,
                        subcategoriaParaDirectorio, // Usar el label en español
                        estructuraFiltro
                    );
                    console.log(`✅ Upload directo completado, response:`, response);
                } else {
                    // Para documentos estructurados, semi-estructurados y no-estructurados, usar el método apropiado
                    
                    // Obtener el label en español para usar en el directorio
                    const subcategoriaObj = SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro);
                    const subcategoriaParaDirectorio = subcategoriaObj?.label || subcategoriaFiltro;
                    
                    console.log(`📊 Subiendo documento ${estructuraFiltro} con subcategoría: ${subcategoriaParaDirectorio}`);
                    
                    if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO) {
                        // Usar el nuevo método específico para documentos no estructurados
                        console.log(`📄 Subiendo documento no estructurado con metadata adicional:`, {
                            totalPaginas,
                            tieneIndice,
                            subcategoria: subcategoriaParaDirectorio
                        });
                        
                        response = await documentApiService.uploadNoStructuredDocument(
                            TWIN_ID_STORAGE,
                            file,
                            subcategoriaParaDirectorio,
                            estructuraFiltro,
                            totalPaginas,
                            tieneIndice
                        );
                    } else {
                        // Para documentos estructurados y semi-estructurados, usar el método tradicional
                        response = await documentApiService.uploadStructuredDocument(
                            TWIN_ID_STORAGE,
                            file,
                            subcategoriaParaDirectorio, // Usar el label en español
                            estructuraFiltro
                        );
                    }
                }
            } else {
                // Fallback: usar upload de documento oficial
                console.log(`🛂 Subiendo documento oficial: ${tipoDocumentoSeleccionado}`);
                response = await documentApiService.uploadOfficialDocument(
                    TWIN_ID_STORAGE,
                    file,
                    tipoDocumentoSeleccionado
                );
            }
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            console.log('🔍 DEBUG: Respuesta recibida del upload:', response);
            console.log('🔍 DEBUG: Tipo de respuesta:', typeof response);
            console.log('🔍 DEBUG: Propiedades disponibles:', Object.keys(response));
            
            // Verificar si fue exitoso basado en el tipo de respuesta
            const isSuccessful = response.success || // Para uploads tradicionales (camelCase)
                                response.id ||     // Para orchestrator (tiene ID de instancia)
                                response.documentId; // Para orchestrator (ID alternativo)
            
            console.log('🔍 DEBUG: isSuccessful determinado como:', isSuccessful);
            console.log('🔍 DEBUG: response.success:', response.success);
            console.log('🔍 DEBUG: response.id:', response.id);
            console.log('🔍 DEBUG: response.documentId:', response.documentId);
            
            if (isSuccessful) {
                console.log('✅ Documento subido exitosamente:', response);
                console.log('🔍 DEBUG: Propiedades de la respuesta:', Object.keys(response));
                console.log('🔍 DEBUG: Respuesta completa:', JSON.stringify(response, null, 2));
                
                // Cerrar el modal de upload inmediatamente
                handleCloseUploadModal();
                
                // Mostrar estadísticas del archivo procesado
                setDatosArchivoProcesado(response);
                setMostrarEstadisticasArchivo(true);
                
                // Manejar respuesta del orchestrator vs upload tradicional
                if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                    // Para orchestrator, mostrar mensaje de confirmación
                    console.log('🤖 Orchestrator iniciado:', response);
                    
                    if (response.documentId || response.id) {
                        const instanceId = response.documentId || response.id;
                        
                        if (instanceId) {
                            setOrchestratorStatus(`✅ Documento enviado para procesamiento con IA - ID: ${instanceId}`);
                            setOrchestratorProgress(100);
                            setIsProcessingOrchestrator(true);
                            
                            // Limpiar el estado del orchestrator después de unos segundos
                            setTimeout(() => {
                                setIsProcessingOrchestrator(false);
                                setOrchestratorStatus('');
                                setOrchestratorProgress(0);
                                
                                console.log('✅ Procesamiento iniciado exitosamente');
                            }, 3000); // 3 segundos
                        }
                    }
                } else {
                    // Upload tradicional - solo log, ya se manejan las estadísticas arriba
                    console.log('📂 Upload tradicional completado:', {
                        success: response.success,
                        message: response.message,
                        fullResponse: response
                    });
                }
                
                setUploadSuccess(true);
                
                // Recargar documentos después de un momento
                setTimeout(async () => {
                    console.log('🔄 Recargando documentos después de upload exitoso...');
                    await loadAllTwinDocuments();
                    console.log('✅ Recarga de documentos completada');
                }, 2000);
                
            } else {
                throw new Error(response.message || 'Error al subir documento');
            }
            
        } catch (error) {
            console.error('❌ Error al subir documento oficial:', error);
            console.error('❌ Tipo de error:', typeof error);
            console.error('❌ Error completo:', error);
            
            // Determinar el tipo de error y mostrar mensaje apropiado
            let errorMessage = 'Error desconocido al subir documento';
            
            if (error instanceof Error) {
                if (error.message === 'Failed to fetch') {
                    errorMessage = 'Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté disponible.';
                } else if (error.message.includes('NetworkError')) {
                    errorMessage = 'Error de red: Problema de conectividad con el servidor.';
                } else if (error.message.includes('HTTP')) {
                    errorMessage = `Error del servidor: ${error.message}`;
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
            }
            
            console.error('❌ Mensaje de error final:', errorMessage);
            alert(errorMessage);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (documentInputRef.current) {
                documentInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('El archivo no puede ser mayor a 10MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simular progreso de subida
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Aquí implementarías la subida real al servidor
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            // Agregar archivo a la lista
            const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
            let estructura = ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
            let subcategoria = "article";
            
            // Clasificación automática básica por extensión
            if (extension === 'csv') {
                estructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                subcategoria = "csv";
            } else if (extension === 'json') {
                estructura = ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                subcategoria = "json";
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                estructura = ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                subcategoria = "article"; // Las imágenes las clasificamos como no estructuradas
            }
            
            const nuevoArchivo: ArchivoPersonal = {
                id: Date.now().toString(),
                nombre: file.name,
                tipo: extension,
                tamaño: file.size,
                fechaSubida: new Date().toISOString().split('T')[0],
                url: URL.createObjectURL(file),
                categoria: "Personal",
                descripcion: `Archivo subido: ${file.name}`,
                etiquetas: ["nuevo"],
                estructura: estructura,
                subcategoria: subcategoria
            };
            
            setArchivos(prev => [nuevoArchivo, ...prev]);
            setUploadSuccess(true);
            setTimeout(() => {
                setUploadSuccess(false);
                setMostrarUpload(false);
                setUploadProgress(0);
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error al subir archivo:', error);
            alert('Error al subir el archivo');
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case 'pdf':
            case 'doc':
            case 'docx':
            case 'txt':
                return <FileText className="w-8 h-8 text-blue-600" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <FileImage className="w-8 h-8 text-green-600" />;
            case 'mp4':
            case 'avi':
            case 'mov':
                return <FileVideo className="w-8 h-8 text-purple-600" />;
            case 'mp3':
            case 'wav':
            case 'flac':
                return <Music className="w-8 h-8 text-orange-600" />;
            case 'zip':
            case 'rar':
            case '7z':
                return <Archive className="w-8 h-8 text-gray-600" />;
            default:
                return <File className="w-8 h-8 text-gray-500" />;
        }
    };

    const archivosFiltrados = archivos.filter(archivo => {
        const matchesSearch = archivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            archivo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            archivo.etiquetas.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Ser más permisivo con archivos cuando no hay estructura definida
        const matchesEstructura = estructuraFiltro === "todas" || 
                                  archivo.estructura === estructuraFiltro ||
                                  (!archivo.estructura && estructuraFiltro === "todas");
        
        // Ser más permisivo con archivos cuando no hay subcategoría definida  
        const matchesSubcategoria = subcategoriaFiltro === "todas" || 
                                   archivo.subcategoria === subcategoriaFiltro ||
                                   (!archivo.subcategoria && subcategoriaFiltro === "todas");
        
        const matches = matchesSearch && matchesEstructura && matchesSubcategoria;
        
        // Debug logging EXPANDIDO para identificar el problema exacto - solo cuando hay filtros activos
        if (archivo.nombre && (estructuraFiltro !== "todas" || subcategoriaFiltro !== "todas" || searchTerm !== "")) {
            console.log(`🔍 FILTRADO DETALLADO del archivo "${archivo.nombre}":`, {
                archivo: {
                    nombre: archivo.nombre,
                    estructura: archivo.estructura,
                    subcategoria: archivo.subcategoria,
                    categoria: archivo.categoria,
                    url: archivo.url,
                    tipo: archivo.tipo
                },
                filtros: { 
                    estructuraFiltro, 
                    subcategoriaFiltro, 
                    searchTerm 
                },
                comparaciones: {
                    estructuraComparison: `"${archivo.estructura}" === "${estructuraFiltro}" = ${archivo.estructura === estructuraFiltro}`,
                    subcategoriaComparison: `"${archivo.subcategoria}" === "${subcategoriaFiltro}" = ${archivo.subcategoria === subcategoriaFiltro}`,
                    searchComparison: `Búsqueda "${searchTerm}" en "${archivo.nombre}" = ${archivo.nombre.toLowerCase().includes(searchTerm.toLowerCase())}`
                },
                matches: { 
                    matchesSearch, 
                    matchesEstructura, 
                    matchesSubcategoria, 
                    matches 
                },
                problema: {
                    expectedEstructura: estructuraFiltro,
                    actualEstructura: archivo.estructura,
                    expectedSubcategoria: subcategoriaFiltro,
                    actualSubcategoria: archivo.subcategoria,
                    razonFallo: !matchesEstructura ? 'FALLA POR ESTRUCTURA' : !matchesSubcategoria ? 'FALLA POR SUBCATEGORÍA' : !matchesSearch ? 'FALLA POR BÚSQUEDA' : 'DEBERÍA PASAR'
                }
            });
        }
        
        return matches;
    });
    
    // Debug: mostrar información de filtrado actual (solo cuando hay cambios significativos)
    // Removido para evitar spam en logs durante renders
    // console.log(`🎯 Estado actual de filtros:`, {
    //     estructuraFiltro,
    //     subcategoriaFiltro,
    //     totalArchivos: archivos.length,
    //     archivosFiltrados: archivosFiltrados.length,
    //     archivosDisponibles: archivos.map(a => ({ nombre: a.nombre, estructura: a.estructura, subcategoria: a.subcategoria }))
    // });

    // Función para manejar cambio de estructura y resetear subcategoría
    const handleEstructuraChange = (nuevaEstructura: string) => {
        console.log(`🔄 Cambiando estructura a: ${nuevaEstructura}`);
        setEstructuraFiltro(nuevaEstructura);
        
        // Reset subcategoría cuando cambie estructura
        setSubcategoriaFiltro("todas");
        
        // Reset filtro de tipo de documento para evitar conflictos
        if (nuevaEstructura !== "todas") {
            setFiltroTipoDocumento("todos");
            setFiltroVendedor("todos");
        }
        
        // Guardar inmediatamente en localStorage para asegurar que se persista
        localStorage.setItem('archivos_filtro_estructura', nuevaEstructura);
        localStorage.setItem('archivos_filtro_subcategoria', "todas");
    };

    // Función para manejar cambio de subcategoría
    const handleSubcategoriaChange = (nuevaSubcategoria: string) => {
        console.log(`🔄 Cambiando subcategoría a: ${nuevaSubcategoria}`);
        setSubcategoriaFiltro(nuevaSubcategoria);
        
        // Reset filtro de tipo de documento para evitar conflictos, pero mantener vendedor si es factura
        if (nuevaSubcategoria !== "todas") {
            setFiltroTipoDocumento("todos");
            // Solo resetear vendedor si no es una subcategoría de factura
            if (nuevaSubcategoria !== "invoice") {
                setFiltroVendedor("todos");
            }
        }
        
        // Guardar inmediatamente en localStorage para asegurar que se persista
        localStorage.setItem('archivos_filtro_subcategoria', nuevaSubcategoria);
    };

    // Función para manejar cambio del filtro de facturas específicas
    const handleFacturaChange = (nuevaFactura: string) => {
        console.log(`🔄 Cambiando filtro de factura a "${nuevaFactura}"`);
        setFacturaFiltro(nuevaFactura);
        localStorage.setItem('archivos_filtro_factura', nuevaFactura);
    };

    // Función para obtener información de estructura
    const getEstructuraInfo = (estructura?: string, subcategoria?: string, nombre?: string, categoria?: string) => {
        if (!estructura) return { icon: "📄", label: "Sin clasificar", color: "text-gray-500" };
        
        // Aplicar reclasificación inteligente si es necesario
        let estructuraCorregida = estructura;
        if (nombre && categoria) {
            const tipoCalculado = getDocumentTypeFromContent(categoria, nombre, subcategoria);
            if (tipoCalculado !== estructura) {
                estructuraCorregida = tipoCalculado;
                console.log(`🔄 Reclasificando documento "${nombre}": ${estructura} → ${estructuraCorregida}`);
            }
        }
        
        switch (estructuraCorregida) {
            case ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO:
                const estructuradoSub = SUBCATEGORIAS_ESTRUCTURA[estructuraCorregida]?.find(s => s.id === subcategoria);
                return {
                    icon: estructuradoSub?.icon || "📊",
                    label: estructuradoSub?.label || "Estructurado",
                    color: "text-green-600"
                };
            case ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO:
                const semiSub = SUBCATEGORIAS_ESTRUCTURA[estructuraCorregida]?.find(s => s.id === subcategoria);
                return {
                    icon: semiSub?.icon || "📋",
                    label: semiSub?.label || "Semi-estructurado",
                    color: "text-blue-600"
                };
            case ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO:
                const noEstructuradoSub = SUBCATEGORIAS_ESTRUCTURA[estructuraCorregida]?.find(s => s.id === subcategoria);
                return {
                    icon: noEstructuradoSub?.icon || "📄",
                    label: noEstructuradoSub?.label || "No estructurado",
                    color: "text-orange-600"
                };
            default:
                return { icon: "📄", label: "Sin clasificar", color: "text-gray-500" };
        }
    };

    const handleDeleteFile = async (documentId: string, nombre: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el archivo "${nombre}"?`)) {
            try {
                console.log(`🗑️ Eliminando documento con ID: "${documentId}" (nombre: "${nombre}")`);
                console.log(`🔍 DEBUG: Tipo de documentId: ${typeof documentId}, valor: "${documentId}"`);
                // Usar el ID del documento en lugar del nombre para la nueva API
                const response = await documentApiService.deleteOfficialDocument(TWIN_ID_STORAGE, documentId);
                if (response.success) {
                    // Actualizar la lista de archivos eliminando el archivo por ID
                    setArchivos(prev => prev.filter(archivo => archivo.id !== documentId));
                    alert('Archivo eliminado correctamente');
                } else {
                    alert('Error al eliminar el archivo: ' + response.message);
                }
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('Error al eliminar el archivo');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Button
                                onClick={() => navigate("/twin-biografia")}
                                variant="outline"
                                size="sm"
                                className="mr-4"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Tus archivos personales</h1>
                                <p className="text-gray-600">Twin: {TWIN_ID_DATABASE} (Storage: {TWIN_ID_STORAGE}) - Gestiona tus documentos y archivos importantes</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Botón para subir documentos oficiales con título dinámico basado en estructura */}
                            <Button 
                                onClick={handleOpenUploadModal}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {(() => {
                                    // Si se seleccionó una subcategoría específica, usar esa
                                    if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                                        const subcategoria = SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro);
                                        if (subcategoria) {
                                            return (
                                                <>
                                                    <span className="mr-2 text-base">{subcategoria.icon}</span>
                                                    {`Subir ${subcategoria.label}`}
                                                </>
                                            );
                                        }
                                    }
                                    
                                    // Si solo se seleccionó estructura, usar estructura general
                                    if (estructuraFiltro !== "todas") {
                                        const estructuraLabels = {
                                            [ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO]: { icon: "📊", label: "Documento Estructurado" },
                                            [ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO]: { icon: "📋", label: "Documento Semi-estructurado" },
                                            [ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO]: { icon: "📄", label: "Documento No estructurado" }
                                        };
                                        const estructuraInfo = estructuraLabels[estructuraFiltro];
                                        if (estructuraInfo) {
                                            return (
                                                <>
                                                    <span className="mr-2 text-base">{estructuraInfo.icon}</span>
                                                    {`Subir ${estructuraInfo.label}`}
                                                </>
                                            );
                                        }
                                    }
                                    
                                    // Default: documento oficial
                                    const tipoSeleccionado = TIPOS_DOCUMENTOS_OFICIALES.find(t => t.id === tipoDocumentoSeleccionado);
                                    return (
                                        <>
                                            <span className="mr-2 text-base">{tipoSeleccionado?.icon || '🛂'}</span>
                                            {`Subir ${tipoSeleccionado?.label || 'Documento Oficial'}`}
                                        </>
                                    );
                                })()}
                            </Button>
                            
                            {/* Botón de recarga */}
                            <Button 
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        console.log('🔄 Recargando documentos desde Cosmos DB con filtros específicos');
                                        console.log('📋 Filtros actuales:', {
                                            estructuraFiltro,
                                            subcategoriaFiltro
                                        });
                                        
                                        // Determinar el documentType basado en la subcategoría seleccionada
                                        let documentType = "todas"; // Default
                                        
                                        if (subcategoriaFiltro !== "todas") {
                                            // Mapear subcategoría a document type en español para el backend
                                            const subcategoriaToDocumentType: { [key: string]: string } = {
                                                // Documentos estructurados
                                                "csv": "CSV",
                                                "json": "JSON", 
                                                "xml": "XML",
                                                "database": "Base de datos",
                                                // Documentos semi-estructurados
                                                "invoice": "Factura",
                                                "license": "Licencia",
                                                "birth_certificate": "Certificado de nacimiento",
                                                "account_statement": "Estado de cuenta",
                                                "form": "Formulario",
                                                // Documentos no estructurados
                                                "contract": "Contrato",
                                                "report": "Reporte",
                                                "email": "Email",
                                                "letter": "Carta",
                                                "article": "Artículo"
                                            };
                                            
                                            documentType = subcategoriaToDocumentType[subcategoriaFiltro] || "todas";
                                        }
                                        
                                        console.log(`🎯 Recargando documentos con documentType: "${documentType}"`);
                                        
                                        if (documentType !== "todas") {
                                            // ✅ LIMPIAR ESTADO ANTERIOR ANTES DE CARGAR ESPECÍFICOS
                                            setArchivos([]);
                                            setTodosLosArchivos([]);
                                            
                                            // Usar el nuevo endpoint de Cosmos DB para tipos específicos
                                            const documentosCosmosDB = await documentApiService.getAllDocumentsFromCosmosDB(TWIN_ID_STORAGE, documentType);
                                            console.log(`✅ Documentos obtenidos desde Cosmos DB: ${documentosCosmosDB.length}`);
                                            
                                            // Convertir DocumentInfo[] a ArchivoPersonal[] para la UI
                                            const archivosFromCosmos = documentosCosmosDB.map(doc => {
                                                // Extraer solo el nombre del archivo de la ruta completa
                                                const nombreArchivo = doc.filename.split('/').pop() || doc.filename;
                                                
                                                // Mapear subcategoría correctamente basado en el documentType
                                                let subcategoriaCorrecta = doc.metadata?.sub_category || doc.sub_category || "article";
                                                let detectedTypeCorrecta = "documento"; // Por defecto
                                                
                                                if (documentType === "Factura") {
                                                    subcategoriaCorrecta = "invoice";
                                                    detectedTypeCorrecta = "factura";
                                                } else if (documentType === "Certificado") {
                                                    subcategoriaCorrecta = "certificate";
                                                    detectedTypeCorrecta = "certificado";
                                                } else if (documentType === "Contrato") {
                                                    subcategoriaCorrecta = "contract";
                                                    detectedTypeCorrecta = "contrato";
                                                }
                                                
                                                console.log(`🔧 Mapeando documento "${doc.filename}" -> "${nombreArchivo}", subcategoría: "${subcategoriaCorrecta}", detectedType: "${detectedTypeCorrecta}"`);
                                                
                                                // ✅ DEBUG: Verificar campos de tamaño disponibles (usando acceso dinámico)
                                                const metadata = doc.metadata as any;
                                                const tamañoFinal = doc.size_bytes || metadata?.fileSize || metadata?.contentLength || metadata?.size || 0;
                                                console.log(`📏 Tamaño para "${nombreArchivo}":`, {
                                                    size_bytes: doc.size_bytes,
                                                    'metadata.fileSize': metadata?.fileSize,
                                                    'metadata.contentLength': metadata?.contentLength,
                                                    'metadata.size': metadata?.size,
                                                    tamañoFinal: tamañoFinal,
                                                    tamañoFormateado: tamañoFinal > 0 ? `${(tamañoFinal / 1024).toFixed(1)} KB` : '0 Bytes'
                                                });
                                                
                                                return {
                                                    id: doc.id || doc.filename,
                                                    nombre: nombreArchivo, // Solo el nombre del archivo, no la ruta completa
                                                    tipo: doc.filename.split('.').pop()?.toLowerCase() || 'unknown',
                                                    tamaño: tamañoFinal, // ✅ USAR EL TAMAÑO CALCULADO
                                                    fechaSubida: doc.last_modified || new Date().toISOString().split('T')[0],
                                                    url: doc.metadata?.documentUrl || doc.public_url,
                                                    categoria: doc.metadata?.sub_category || doc.sub_category || "Documento",
                                                    descripcion: doc.content_summary || `Documento de tipo ${doc.document_type || 'desconocido'}`,
                                                    etiquetas: doc.metadata?.tags || [],
                                                    estructura: (() => {
                                                        const structureType = doc.structure_type || doc.metadata?.structure_type || '';
                                                        if (structureType.toLowerCase().includes('semi')) {
                                                            return ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO;
                                                        } else if (structureType.toLowerCase().includes('structured')) {
                                                            return ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO;
                                                        } else {
                                                            return ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO;
                                                        }
                                                    })(),
                                                    subcategoria: subcategoriaCorrecta, // Usar la subcategoría mapeada correctamente
                                                    detectedType: detectedTypeCorrecta, // ✅ AGREGAR DETECTED TYPE PARA LOS CONTADORES
                                                    documentMetadata: doc.metadata,
                                                    
                                                    // Agregar campos adicionales para navegación desde metadatos
                                                    sasUrl: doc.metadata?.sasUrl || doc.public_url,
                                                    AiExecutiveSummaryHtml: doc.metadata?.AiExecutiveSummaryHtml,
                                                    vendorName: doc.metadata?.vendorName,
                                                    invoiceTotal: doc.metadata?.invoiceTotal,
                                                    metadata: doc.metadata // Preservar todos los metadatos
                                                };
                                            });
                                            
                                            setArchivos(archivosFromCosmos);
                                            setTodosLosArchivos(archivosFromCosmos); // ✅ ACTUALIZAR TAMBIÉN LOS CONTADORES
                                            console.log(`📊 Total archivos cargados desde Cosmos DB: ${archivosFromCosmos.length}`);
                                            
                                            // ✅ Debug: Verificar contadores después de la actualización
                                            console.log(`🔢 Contadores actualizados:`, {
                                                todos: archivosFromCosmos.length,
                                                facturas: archivosFromCosmos.filter(a => 
                                                    a.detectedType === 'factura' || 
                                                    a.categoria?.includes('Factura') ||
                                                    a.subcategoria === 'invoice' ||
                                                    a.etiquetas?.some(e => e.includes('factura') || e.includes('invoice')) ||
                                                    a.nombre?.toLowerCase().includes('factura') ||
                                                    a.nombre?.toLowerCase().includes('invoice')
                                                ).length,
                                                contratos: archivosFromCosmos.filter(a => 
                                                    a.detectedType === 'contrato' ||
                                                    a.categoria?.includes('Contrato') ||
                                                    a.subcategoria === 'contract'
                                                ).length
                                            });
                                            
                                            // ✅ Debug específico: Verificar metadatos de facturas
                                            archivosFromCosmos.forEach(archivo => {
                                                if (archivo.detectedType === 'factura') {
                                                    console.log(`💰 FACTURA "${archivo.nombre}" - Metadata:`, {
                                                        vendorName: archivo.documentMetadata?.vendorName,
                                                        invoiceTotal: archivo.documentMetadata?.invoiceTotal,
                                                        invoiceNumber: archivo.documentMetadata?.invoiceNumber,
                                                        tieneMetadata: !!archivo.documentMetadata,
                                                        metadataKeys: archivo.documentMetadata ? Object.keys(archivo.documentMetadata) : []
                                                    });
                                                }
                                            });
                                        } else {
                                            // ✅ LIMPIAR ESTADO ANTERIOR ANTES DE CARGAR GENERALES
                                            setArchivos([]);
                                            setTodosLosArchivos([]);
                                            
                                            // Para "todas", usar el endpoint general
                                            await loadAllTwinDocuments();
                                        }
                                        
                                        console.log('✅ Recarga completada');
                                    } catch (error) {
                                        console.error('❌ Error al recargar documentos:', error);
                                        setLoadError('Error al recargar documentos');
                                    }
                                    setIsLoading(false);
                                }}
                                variant="outline"
                                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                disabled={isLoading}
                            >
                                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                {isLoading ? 'Cargando...' : 'Recargar'}
                            </Button>
                            
                            {/* Botón de debug temporal */}
                            <Button 
                                onClick={() => {
                                    console.log('🐛 DEBUG - Estado actual completo:', {
                                        estructuraFiltro,
                                        subcategoriaFiltro,
                                        totalArchivos: archivos.length,
                                        archivos: archivos,
                                        archivosFiltrados: archivosFiltrados.length
                                    });
                                    
                                    // Solo hacer llamadas a la API si hay filtros específicos seleccionados
                                    if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                                        // Mapear la subcategoría seleccionada al formato del backend
                                        const subcategoriaMapping: { [key: string]: string } = {
                                            "csv": "CSV",
                                            "json": "JSON", 
                                            "xml": "XML",
                                            "database": "Base de datos",
                                            "invoice": "Facturas",
                                            "license": "Licencias",
                                            "birth_certificate": "Certificados de nacimiento",
                                            "account_statement": "Estados de cuenta",
                                            "form": "Formularios",
                                            "contract": "Contratos",
                                            "report": "Reportes",
                                            "email": "Emails",
                                            "letter": "Cartas",
                                            "article": "Artículos"
                                        };
                                        
                                        const backendSubcategoria = subcategoriaMapping[subcategoriaFiltro] || subcategoriaFiltro;
                                        const backendEstructura = estructuraFiltro === "semi-estructurado" ? "Semi-estructurado" : 
                                                                estructuraFiltro === "estructurado" ? "Estructurado" : 
                                                                "No-estructurado";
                                        
                                        console.log(`🔍 Probando con selección actual: ${backendEstructura}/${backendSubcategoria}`);
                                        
                                        documentApiService.listStructuredDocuments(TWIN_ID_STORAGE, backendEstructura, backendSubcategoria)
                                            .then(response => {
                                                console.log(`🔍 Llamada con filtros seleccionados (${backendEstructura}/${backendSubcategoria}):`, response);
                                            });
                                    } else {
                                        console.log('🔍 No hay filtros específicos seleccionados, probando sin filtros...');
                                        documentApiService.listStructuredDocuments(TWIN_ID_STORAGE)
                                            .then(response => {
                                                console.log('🔍 Llamada sin filtros:', response);
                                            });
                                    }
                                }}
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                                size="sm"
                            >
                                🐛 Debug
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mensaje de éxito del Orchestrator - Fuera del modal */}
                {isProcessingOrchestrator && (
                    <div className="mb-6 max-w-4xl mx-auto">
                        <div className="bg-green-600 border border-green-700 rounded-lg p-4 shadow-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-lg font-medium text-white">
                                        ✅ Documento enviado exitosamente
                                    </h3>
                                    <div className="mt-2 text-green-100">
                                        <p className="text-sm">
                                            Su documento está siendo procesado automáticamente por nuestro sistema de IA. 
                                            Este proceso puede tomar entre <strong className="text-white">0 y 5 minutos</strong>.
                                        </p>
                                        
                                        {/* Mostrar ID del Orchestrator para testing manual */}
                                        {orchestratorStatus.includes('ID:') && (
                                            <div className="mt-3 bg-green-700 rounded p-2">
                                                <div className="flex items-center text-xs">
                                                    <svg className="w-4 h-4 text-green-200 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-green-200 mr-2">ID del Orchestrator:</span>
                                                </div>
                                                <code className="text-xs text-white bg-green-800 px-2 py-1 rounded font-mono block mt-1">
                                                    {orchestratorStatus.split('ID: ')[1]}
                                                </code>
                                            </div>
                                        )}
                                        
                                        <p className="text-xs text-green-200 mt-2">
                                            Los documentos procesados aparecerán automáticamente en la lista cuando estén listos.
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => {
                                            setIsProcessingOrchestrator(false);
                                            setOrchestratorStatus('');
                                            setOrchestratorProgress(0);
                                        }}
                                        className="text-green-200 hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Upload de Documentos Oficiales */}
                {mostrarUploadOficial && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    {(() => {
                                        // Si se seleccionó una subcategoría específica, usar esa
                                        if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                                            const subcategoria = SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro);
                                            if (subcategoria) {
                                                return (
                                                    <>
                                                        <span className="text-xl mr-2">{subcategoria.icon}</span>
                                                        {`Subir ${subcategoria.label}`}
                                                    </>
                                                );
                                            }
                                        }
                                        
                                        // Si solo se seleccionó estructura, usar estructura general
                                        if (estructuraFiltro !== "todas") {
                                            const estructuraLabels = {
                                                [ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO]: { icon: "📊", label: "Documento Estructurado" },
                                                [ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO]: { icon: "📋", label: "Documento Semi-estructurado" },
                                                [ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO]: { icon: "📄", label: "Documento No estructurado" }
                                            };
                                            const estructuraInfo = estructuraLabels[estructuraFiltro];
                                            if (estructuraInfo) {
                                                return (
                                                    <>
                                                        <span className="text-xl mr-2">{estructuraInfo.icon}</span>
                                                        {`Subir ${estructuraInfo.label}`}
                                                    </>
                                                );
                                            }
                                        }
                                        
                                        // Default: documento oficial
                                        const tipoSeleccionado = TIPOS_DOCUMENTOS_OFICIALES.find(t => t.id === tipoDocumentoSeleccionado);
                                        return (
                                            <>
                                                <span className="text-xl mr-2">{tipoSeleccionado?.icon || '🛂'}</span>
                                                {`Subir ${tipoSeleccionado?.label || 'Documento Oficial'}`}
                                            </>
                                        );
                                    })()}
                                </h3>
                                <button
                                    onClick={handleCloseUploadModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Selector de tipo de documento - solo visible para documentos oficiales */}
                            {(estructuraFiltro === "todas" || subcategoriaFiltro === "todas") && estructuraFiltro !== ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de documento oficial
                                    </label>
                                    <select
                                        value={tipoDocumentoSeleccionado}
                                        onChange={(e) => setTipoDocumentoSeleccionado(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {TIPOS_DOCUMENTOS_OFICIALES.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.icon} {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Información del tipo de archivo seleccionado - para documentos estructurados */}
                            {estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas" && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        {(() => {
                                            const subcategoria = SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro);
                                            return (
                                                <>
                                                    <span className="text-lg mr-2">{subcategoria?.icon}</span>
                                                    <span className="font-medium text-green-800">
                                                        Subiendo: {subcategoria?.label}
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <p className="text-sm text-green-700">
                                        Estructura: {estructuraFiltro.charAt(0).toUpperCase() + estructuraFiltro.slice(1)}
                                    </p>
                                </div>
                            )}

                            {/* Campos adicionales para documentos no estructurados */}
                            {estructuraFiltro === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO && subcategoriaFiltro !== "todas" && (
                                <div className="mb-4 space-y-4">
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-yellow-900 mb-3">
                                            📋 Información requerida para documentos no estructurados
                                        </h4>
                                        
                                        {/* Campo: ¿Tiene índice? */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ¿El documento tiene índice o tabla de contenidos?
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="tieneIndice"
                                                        checked={tieneIndice === true}
                                                        onChange={() => {
                                                            setTieneIndice(true);
                                                            setValidationError(null);
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">Sí</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="tieneIndice"
                                                        checked={tieneIndice === false}
                                                        onChange={() => {
                                                            setTieneIndice(false);
                                                            setValidationError(null);
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">No</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Campo: Número de páginas */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ¿Cuántas páginas tiene el documento?
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="9999"
                                                value={totalPaginas}
                                                onChange={(e) => {
                                                    setTotalPaginas(parseInt(e.target.value) || 1);
                                                    setValidationError(null);
                                                }}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Ej: 25"
                                            />
                                        </div>

                                        {/* Mensaje de validación */}
                                        {!tieneIndice && totalPaginas > 30 && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <div className="flex items-start space-x-2">
                                                    <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-red-800">
                                                            ⚠️ Índice requerido
                                                        </p>
                                                        <p className="text-sm text-red-700">
                                                            Los documentos de más de 30 páginas sin índice no pueden ser procesados. 
                                                            Por favor, agregue un índice o tabla de contenidos al documento antes de subirlo.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mensaje informativo para documentos válidos */}
                                        {(tieneIndice || totalPaginas <= 30) && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-start space-x-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-green-800">
                                                            ✅ Documento válido
                                                        </p>
                                                        <p className="text-sm text-green-700">
                                                            {tieneIndice 
                                                                ? "El documento tiene índice y puede ser procesado correctamente."
                                                                : "El documento tiene menos de 30 páginas y puede ser procesado sin índice."
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Instrucciones de uso mejoradas con ejemplos */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas" ? (
                                            <span className="text-xl">
                                                {SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro)?.icon || '📄'}
                                            </span>
                                        ) : (
                                            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                                            {estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas" ? (
                                                `📄 Instrucciones para subir ${SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro)?.label || 'archivo'}`
                                            ) : (
                                                '📄 Instrucciones para subir documentos oficiales'
                                            )}
                                        </h4>
                                        {/* Instrucciones específicas para cada tipo */}
                                        {estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas" ? (
                                            <div>
                                                {/* Instrucciones para archivos estructurados específicos */}
                                                {subcategoriaFiltro === 'csv' && (
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• <strong>Formato requerido:</strong> CSV (.csv)</li>
                                                        <li>• <strong>Estructura:</strong> Primera fila debe contener encabezados</li>
                                                        <li>• <strong>Separador:</strong> Coma (,) recomendado</li>
                                                        <li>• <strong>Codificación:</strong> UTF-8 preferible</li>
                                                        <li>• <strong>Tamaño máximo:</strong> 10MB</li>
                                                    </ul>
                                                )}
                                                {subcategoriaFiltro === 'json' && (
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• <strong>Formato requerido:</strong> JSON (.json)</li>
                                                        <li>• <strong>Estructura:</strong> JSON válido requerido</li>
                                                        <li>• <strong>Codificación:</strong> UTF-8</li>
                                                        <li>• <strong>Tamaño máximo:</strong> 10MB</li>
                                                    </ul>
                                                )}
                                                {['invoice', 'license', 'birth_certificate', 'account_statement', 'form'].includes(subcategoriaFiltro) && (
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• <strong>Formatos aceptados:</strong> PDF, JPG, PNG</li>
                                                        <li>• <strong>Calidad:</strong> Texto legible para extracción de datos</li>
                                                        <li>• <strong>Tamaño máximo:</strong> 10MB</li>
                                                        <li>• <strong>Orientación:</strong> Vertical preferible</li>
                                                    </ul>
                                                )}
                                                {['contract', 'report', 'letter', 'article'].includes(subcategoriaFiltro) && (
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• <strong>Formatos aceptados:</strong> PDF, DOC, DOCX, TXT</li>
                                                        <li>• <strong>Contenido:</strong> Texto procesable</li>
                                                        <li>• <strong>Tamaño máximo:</strong> 10MB</li>
                                                    </ul>
                                                )}
                                            </div>
                                        ) : (
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• <strong>Formatos aceptados:</strong> PDF, JPG, PNG, WEBP, TIFF, BMP</li>
                                                <li>• <strong>Tamaño máximo:</strong> 10MB por archivo</li>
                                                <li>• <strong>Calidad:</strong> Asegúrate de que el texto sea legible</li>
                                                <li>• <strong>Seguridad:</strong> Los archivos se almacenan de forma segura en Azure</li>
                                            </ul>
                                        )}
                                        
                                        <div className="mt-3 pt-2 border-t border-blue-200">
                                            <h5 className="text-xs font-medium text-blue-900 mb-2">📊 Ejemplos de documentos por estructura:</h5>
                                            <div className="space-y-2">
                                                <div className="flex items-center text-xs text-green-700">
                                                    <span className="mr-2">�</span>
                                                    <strong>Estructurados:</strong> 
                                                    <span className="ml-1">datos_personales.csv, informacion.json, config.xml</span>
                                                </div>
                                                <div className="flex items-start text-xs text-blue-700">
                                                    <span className="mr-2 mt-0.5">🧾</span>
                                                    <div>
                                                        <strong>Semi-estructurados (Solo PDF):</strong>
                                                        <div className="ml-0 mt-1 text-blue-600">
                                                            factura_servicios.pdf, certificado_nacimiento.pdf, formulario_registro.pdf
                                                        </div>
                                                        <div className="ml-0 mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                            ⚡ Solo PDF para mejor procesamiento con Azure AI
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-xs text-orange-700">
                                                    <span className="mr-2">📄</span>
                                                    <strong>No estructurados:</strong> 
                                                    <span className="ml-1">contrato_trabajo.pdf, carta_recomendacion.pdf, articulo_prensa.pdf</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {!isUploading && !uploadSuccess && (
                                <div>
                                    <input
                                        type="file"
                                        ref={documentInputRef}
                                        onChange={handleDocumentChange}
                                        accept={(() => {
                                            // Aceptar tipos específicos según la subcategoría seleccionada
                                            if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                                                switch(subcategoriaFiltro) {
                                                    case 'csv':
                                                        return ".csv";
                                                    case 'json':
                                                        return ".json";
                                                    case 'xml':
                                                        return ".xml";
                                                    case 'invoice':
                                                    case 'license':
                                                    case 'birth_certificate':
                                                    case 'account_statement':
                                                    case 'form':
                                                        return ".pdf"; // Solo PDF para documentos semi-estructurados
                                                    case 'contract':
                                                    case 'report':
                                                    case 'letter':
                                                    case 'article':
                                                        return ".pdf,.doc,.docx,.txt";
                                                    default:
                                                        return ".pdf,.jpg,.jpeg,.png,.webp,.tiff,.bmp";
                                                }
                                            }
                                            // Default para documentos oficiales
                                            return ".pdf,.jpg,.jpeg,.png,.webp,.tiff,.bmp";
                                        })()}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={handleDocumentUpload}
                                        className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors"
                                    >
                                        <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                                        <p className="text-indigo-600 font-medium mb-2">
                                            {(() => {
                                                // Si se seleccionó una subcategoría específica, usar esa
                                                if (estructuraFiltro !== "todas" && subcategoriaFiltro !== "todas") {
                                                    const subcategoria = SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.find(s => s.id === subcategoriaFiltro);
                                                    if (subcategoria) {
                                                        return `Seleccionar ${subcategoria.label}`;
                                                    }
                                                }
                                                
                                                // Si solo se seleccionó estructura, usar estructura general
                                                if (estructuraFiltro !== "todas") {
                                                    const estructuraLabels = {
                                                        [ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO]: "archivo estructurado",
                                                        [ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO]: "archivo semi-estructurado",
                                                        [ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO]: "archivo no estructurado"
                                                    };
                                                    return `Seleccionar ${estructuraLabels[estructuraFiltro] || 'archivo'}`;
                                                }
                                                
                                                // Default: tipo de documento oficial
                                                const tipoSeleccionado = TIPOS_DOCUMENTOS_OFICIALES.find(t => t.id === tipoDocumentoSeleccionado);
                                                return `Seleccionar ${tipoSeleccionado?.label || 'archivo'}`;
                                            })()}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-3">
                                            {(() => {
                                                // Mostrar tipos de archivo permitidos según el contexto
                                                if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO) {
                                                    return (
                                                        <span className="text-orange-600 font-medium">
                                                            📋 Solo PDF (máx. 10MB) - Optimizado para procesamiento con IA
                                                        </span>
                                                    );
                                                } else if (estructuraFiltro === ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO) {
                                                    if (subcategoriaFiltro === "csv") {
                                                        return "📊 Solo archivos CSV (máx. 10MB)";
                                                    } else if (subcategoriaFiltro === "json") {
                                                        return "🔗 Solo archivos JSON (máx. 10MB)";
                                                    } else if (subcategoriaFiltro === "xml") {
                                                        return "📝 Solo archivos XML (máx. 10MB)";
                                                    } else {
                                                        return "📊 CSV, JSON, XML, DB (máx. 10MB)";
                                                    }
                                                } else {
                                                    return "PDF, JPG, PNG, WEBP, TIFF, BMP (máx. 10MB)";
                                                }
                                            })()}
                                        </p>
                                        
                                        {/* Ejemplos de archivos */}
                                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                            <p className="text-xs text-gray-600 font-medium mb-2">📎 Ejemplos de archivos:</p>
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                    📊 datos.csv
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                    🧾 factura.pdf
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                                    📄 contrato.pdf
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                    👶 certificado.pdf
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {isUploading && (
                                <div className="text-center py-8">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">Subiendo documento...</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                    <p className="text-green-600 font-medium">¡Documento subido exitosamente!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Upload Modal (existente) */}
                {mostrarUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Subir Archivo</h3>
                                <button
                                    onClick={() => setMostrarUpload(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {!isUploading && !uploadSuccess ? (
                                <div>
                                    {/* Validar si el documento no estructurado puede ser subido */}
                                    {estructuraFiltro === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO && 
                                     subcategoriaFiltro !== "todas" && 
                                     !tieneIndice && 
                                     totalPaginas > 30 ? (
                                        // Área de upload deshabilitada para documentos no válidos
                                        <div className="border-2 border-dashed border-red-300 rounded-lg p-8 text-center bg-red-50">
                                            <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                            <p className="text-red-600 mb-2 font-medium">Upload no permitido</p>
                                            <p className="text-sm text-red-500">
                                                Debe agregar un índice al documento antes de continuar
                                            </p>
                                        </div>
                                    ) : (
                                        // Área de upload normal
                                        <div
                                            onClick={handleFileUpload}
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                                        >
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-2">Haz clic para seleccionar un archivo</p>
                                            <p className="text-sm text-gray-500">Máximo 10MB</p>
                                        </div>
                                    )}
                                    
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                                    />
                                </div>
                            ) : uploadSuccess ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-green-600 font-semibold">¡Archivo subido exitosamente!</p>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
                                    <p className="text-center text-gray-600 mb-4">Subiendo archivo...</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Búsqueda y filtros de estructura */}
                        <div className="flex items-center space-x-4 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar archivos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Estructura:</span>
                            </div>
                            
                            <select
                                value={estructuraFiltro}
                                onChange={(e) => handleEstructuraChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                data-testid="selector-estructura"
                            >
                                <option value="todas">Todas las estructuras</option>
                                <option value={ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO}>📊 Estructurado</option>
                                <option value={ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO}>📋 Semi-estructurado</option>
                                <option value={ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO}>📄 No estructurado</option>
                            </select>

                            {/* Dropdown de subcategorías (solo visible si se seleccionó una estructura) */}
                            {estructuraFiltro !== "todas" && (
                                <select
                                    value={subcategoriaFiltro}
                                    onChange={(e) => handleSubcategoriaChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    name="subcategoria"
                                    data-testid="selector-subcategoria"
                                >
                                    <option value="todas">Todas las subcategorías</option>
                                    {SUBCATEGORIAS_ESTRUCTURA[estructuraFiltro]?.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.icon} {sub.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                            
                            {/* Dropdown de facturas específicas (solo visible si se seleccionó semi-estructurado + factura) */}
                            {estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO && 
                             subcategoriaFiltro === 'factura' && 
                             obtenerFacturasDisponibles().length > 0 && (
                                <select
                                    value={facturaFiltro}
                                    onChange={(e) => handleFacturaChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    name="factura"
                                    data-testid="selector-factura"
                                >
                                    <option value="todas">Todas las facturas</option>
                                    {obtenerFacturasDisponibles().map(factura => (
                                        <option key={factura.id} value={factura.id}>
                                            💰 {factura.displayName}
                                        </option>
                                    ))}
                                </select>
                            )}
                            
                            {/* Mensaje informativo para documentos semi-estructurados */}
                            {estructuraFiltro === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                                    <div className="flex items-start space-x-2">
                                        <span className="text-orange-500 mt-0.5">⚡</span>
                                        <div>
                                            <p className="text-orange-800 font-medium">Solo archivos PDF</p>
                                            <p className="text-orange-700 text-xs mt-1">
                                                Los documentos semi-estructurados como facturas y certificados 
                                                se procesan mejor en formato PDF usando Azure AI Document Intelligence.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botón para limpiar filtros */}
                            {(estructuraFiltro !== "todas" || subcategoriaFiltro !== "todas" || facturaFiltro !== "todas" || searchTerm) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEstructuraFiltro("todas");
                                        setSubcategoriaFiltro("todas");
                                        setFacturaFiltro("todas");
                                        setSearchTerm("");
                                    }}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <X size={14} className="mr-1" />
                                    Limpiar filtros
                                </Button>
                            )}
                        </div>
                        
                        {/* Vista en grid/lista */}
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={viewMode === "grid" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid size={16} />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                            >
                                <List size={16} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Botones de filtrado rápido por tipo de documento */}
                <div className="mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrado rápido por tipo:</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFiltroTipoDocumento("todos");
                                    setFiltroVendedor("todos");
                                }}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                                📁 Todos ({todosLosArchivos.length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFiltroTipoDocumento("factura");
                                    setFiltroVendedor("todos");
                                }}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                                💰 Facturas ({todosLosArchivos.filter(a => 
                                    a.detectedType === 'factura' || 
                                    a.categoria?.includes('Factura') ||
                                    a.subcategoria === 'invoice' ||
                                    a.etiquetas?.some(e => e.includes('factura') || e.includes('invoice')) ||
                                    a.nombre?.toLowerCase().includes('factura') ||
                                    a.nombre?.toLowerCase().includes('invoice')
                                ).length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFiltroTipoDocumento("contrato");
                                    setFiltroVendedor("todos");
                                }}
                                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            >
                                📋 Contratos ({todosLosArchivos.filter(a => 
                                    a.detectedType === 'contrato' || 
                                    a.categoria?.includes('Contrato') ||
                                    a.subcategoria === 'contract' ||
                                    a.etiquetas?.some(e => e.includes('contrato') || e.includes('contract')) ||
                                    a.nombre?.toLowerCase().includes('contrato') ||
                                    a.nombre?.toLowerCase().includes('contract')
                                ).length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFiltroTipoDocumento("reporte");
                                    setFiltroVendedor("todos");
                                }}
                                className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                            >
                                📊 Reportes ({todosLosArchivos.filter(a => 
                                    a.detectedType === 'reporte' || 
                                    a.categoria?.includes('Reporte') ||
                                    a.subcategoria === 'report' ||
                                    a.etiquetas?.some(e => e.includes('reporte') || e.includes('report')) ||
                                    a.nombre?.toLowerCase().includes('reporte') ||
                                    a.nombre?.toLowerCase().includes('report')
                                ).length})
                            </Button>
                        </div>

                        {/* Filtro de vendedor - solo cuando se muestran facturas */}
                        {filtroTipoDocumento === "factura" && (
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Filtrar por vendedor:</span>
                                </div>
                                
                                <select
                                    value={filtroVendedor}
                                    onChange={(e) => setFiltroVendedor(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-w-48"
                                    data-testid="selector-vendedor"
                                >
                                    <option value="todos">Todos los vendedores</option>
                                    {obtenerVendedoresUnicos().map((vendedor) => (
                                        <option key={vendedor} value={vendedor}>
                                            🏢 {vendedor}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de archivos */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={48} className="animate-spin text-indigo-600" />
                    </div>
                ) : loadError ? (
                    <div className="text-center py-12">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                            <h2 className="text-red-800 font-semibold mb-2">Error al cargar archivos</h2>
                            <p className="text-red-600 mb-4">{loadError}</p>
                            <Button onClick={loadArchivos} variant="outline">
                                Reintentar
                            </Button>
                        </div>
                    </div>
                ) : archivosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {archivos.length === 0 ? `No hay archivos para el Twin ${TWIN_ID_DATABASE}` : "No se encontraron archivos"}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {archivos.length === 0 
                                ? "Los archivos personales se almacenarán en Azure Data Lake cuando se implementen las funciones de subida"
                                : "Intenta con otros términos de búsqueda o categorías"
                            }
                        </p>
                        {archivos.length === 0 && (
                            <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                <p className="mb-2"><strong>Estado del sistema:</strong></p>
                                <ul className="text-left space-y-1">
                                    <li>✅ Twin {TWIN_ID_DATABASE} encontrado en Cosmos DB</li>
                                    <li>🔧 Funciones de archivos en desarrollo</li>
                                    <li>📁 Data Lake configurado para documentos</li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* DEBUG: Log para ver archivos disponibles */}
                        {console.log(`🎯 RENDERIZANDO CARDS: ${archivosFiltrados.length} archivos filtrados de ${archivos.length} archivos totales`, {
                            filtros: { estructuraFiltro, subcategoriaFiltro, searchTerm },
                            archivos: archivos.slice(0, 3).map(a => ({ nombre: a.nombre, estructura: a.estructura, subcategoria: a.subcategoria })),
                            archivosFiltrados: archivosFiltrados.slice(0, 3).map(a => ({ nombre: a.nombre, estructura: a.estructura, subcategoria: a.subcategoria }))
                        })}
                        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                            {archivosFiltrados.map((archivo) => {
                                // Detectar si es un documento no estructurado con nuevos metadatos
                                const isNoStructuredDoc = archivo.noStructuredMetadata != null;
                                
                                if (isNoStructuredDoc) {
                                    // Card profesional ULTRA MEJORADO para documentos no estructurados
                                    const metadata = archivo.noStructuredMetadata!;
                                    return (
                                        <div key={archivo.id} className="group bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl shadow-2xl border-4 border-yellow-400 p-8 hover:shadow-3xl hover:scale-[1.02] transition-all duration-700 relative overflow-hidden">
                                            {/* Decoraciones de fondo MUY LLAMATIVAS */}
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full -translate-y-20 translate-x-20 group-hover:scale-110 transition-transform duration-700 opacity-80"></div>
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full translate-y-16 -translate-x-16 group-hover:scale-110 transition-transform duration-700 opacity-80"></div>
                                            <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full -translate-x-10 -translate-y-10 group-hover:rotate-45 transition-transform duration-700 opacity-80"></div>                                        {/* Header con icono ultra profesional */}
                                        <div className="relative z-10 flex items-center justify-between mb-8">
                                            <div className="flex items-center space-x-5">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-500 border-2 border-white/20">
                                                        <FileText className="w-8 h-8 text-white drop-shadow-lg" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                        <span className="text-white text-sm font-bold">✨</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-800 text-xl mb-1">📄 {metadata.documentID}</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-indigo-700 font-bold bg-gradient-to-r from-indigo-100 to-blue-100 px-3 py-1 rounded-full border border-indigo-200">
                                                            {metadata.subcategoria}
                                                        </span>
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">ID: {metadata.documentID.split('.')[0]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={() => {
                                                        navigate(`/twin-biografia/documento/${metadata.twinID}/${metadata.documentID}`);
                                                    }}
                                                    className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                                                    title="Ver documento completo"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteFile(archivo.id, `Documento ${metadata.documentID}`)}
                                                    className="p-4 bg-gradient-to-br from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                                                    title="Eliminar documento"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* TOKENS MUY PROMINENTES CON COLORES VIBRANTES */}
                                        <div className="relative z-10 bg-gradient-to-r from-rose-100 via-orange-100 to-yellow-100 rounded-3xl p-8 border-3 border-gradient-to-r from-rose-400 to-yellow-400 shadow-2xl mb-8 hover:shadow-3xl transition-all duration-500 transform hover:scale-102">
                                            <div className="flex items-center justify-center space-x-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-3xl animate-pulse border-4 border-white">
                                                        <span className="text-white text-3xl drop-shadow-lg">💎</span>
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-spin-slow">
                                                        <span className="text-white text-lg">✨</span>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-4xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">{metadata.totalTokens.toLocaleString()}</p>
                                                    <p className="text-xl text-orange-700 font-black tracking-wide">🚀 TOKENS PROCESADOS</p>
                                                </div>
                                                {metadata.searchScore > 0 && (
                                                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 shadow-xl border-2 border-yellow-300">
                                                        <p className="text-2xl font-black text-yellow-700">⭐ {metadata.searchScore.toFixed(2)}</p>
                                                        <p className="text-sm text-yellow-600 font-bold">RELEVANCIA</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Grid de estadísticas ULTRA COLORIDO */}
                                        <div className="relative z-10 grid grid-cols-2 gap-6 mb-8">
                                            {/* Capítulos con ICONO SVG VIBRANTE */}
                                            <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-3xl p-6 border-4 border-yellow-300 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-1 relative overflow-hidden" style={{boxShadow: '0 25px 50px rgba(249, 115, 22, 0.8)'}}>
                                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-30 animate-pulse"></div>
                                                <div className="flex items-center space-x-4 relative z-10">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce border-6 border-white ring-8 ring-yellow-300" style={{boxShadow: '0 0 50px rgba(245, 158, 11, 1)'}}>
                                                            <svg className="w-12 h-12 animate-pulse" viewBox="0 0 24 24" fill="none">
                                                                <defs>
                                                                    <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                        <stop offset="0%" stopColor="#fbbf24" />
                                                                        <stop offset="50%" stopColor="#f97316" />
                                                                        <stop offset="100%" stopColor="#dc2626" />
                                                                    </linearGradient>
                                                                </defs>
                                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#bookGradient)" strokeWidth="3" strokeLinecap="round"/>
                                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="url(#bookGradient)" stroke="#ffffff" strokeWidth="2"/>
                                                                <path d="M9 7h6M9 11h6M9 15h4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                                                            </svg>
                                                        </div>
                                                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-lime-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center animate-spin border-4 border-white" style={{boxShadow: '0 0 25px rgba(74, 222, 128, 1)'}}>
                                                            <span className="text-white text-xl font-black animate-pulse">{metadata.totalChapters}</span>
                                                        </div>
                                                        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-ping" style={{boxShadow: '0 0 20px rgba(168, 85, 247, 1)'}}></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-3xl font-black text-white animate-pulse drop-shadow-2xl">CAPÍTULOS</p>
                                                        <p className="text-xl text-yellow-100 font-bold animate-bounce">Secciones Completas</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Páginas con ICONO SVG VIBRANTE */}
                                            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl p-6 border-4 border-cyan-300 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-rotate-1 relative overflow-hidden" style={{boxShadow: '0 25px 50px rgba(59, 130, 246, 0.8)'}}>
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-300 opacity-30 animate-pulse"></div>
                                                <div className="flex items-center space-x-4 relative z-10">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce border-6 border-white ring-8 ring-cyan-300" style={{boxShadow: '0 0 50px rgba(34, 211, 238, 1)'}}>
                                                            <svg className="w-12 h-12 animate-pulse" viewBox="0 0 24 24" fill="none">
                                                                <defs>
                                                                    <linearGradient id="pageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                        <stop offset="0%" stopColor="#22d3ee" />
                                                                        <stop offset="50%" stopColor="#3b82f6" />
                                                                        <stop offset="100%" stopColor="#8b5cf6" />
                                                                    </linearGradient>
                                                                </defs>
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="url(#pageGradient)" stroke="#ffffff" strokeWidth="2"/>
                                                                <path d="M14 2v6h6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M16 13H8M16 17H8M10 9H8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                                                                <circle cx="12" cy="12" r="1" fill="#ffffff" className="animate-ping"/>
                                                            </svg>
                                                        </div>
                                                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 rounded-full flex items-center justify-center animate-spin border-4 border-white" style={{boxShadow: '0 0 25px rgba(16, 185, 129, 1)'}}>
                                                            <span className="text-white text-xl font-black animate-pulse">{metadata.totalPages}</span>
                                                        </div>
                                                        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full animate-ping" style={{boxShadow: '0 0 20px rgba(249, 115, 22, 1)'}}></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-3xl font-black text-white animate-pulse drop-shadow-2xl">PÁGINAS</p>
                                                        <p className="text-xl text-cyan-100 font-bold animate-bounce">Contenido Total</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Footer con colores vibrantes */}
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                                                    <span className="text-white text-xl">�️</span>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-blue-800">PROCESADO</p>
                                                    <p className="text-sm font-bold text-blue-600">
                                                        {new Date(metadata.processedAt).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 text-white px-8 py-4 rounded-full font-black text-lg shadow-2xl animate-pulse border-4 border-white">
                                                � NO ESTRUCTURADO
                                                <span className="text-2xl">🎯</span> NO ESTRUCTURADO
                                            </div>
                                        </div>
                                    </div>
                                );
                                }
                                
                                // Card original para otros tipos de documentos
                                return (
                                    <div key={archivo.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {getFileIcon(archivo.tipo)}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 truncate text-xs" style={{ fontSize: '9px' }}>{archivo.nombre}</h3>
                                                    <p className="text-sm text-gray-500">{archivo.categoria}</p>
                                                    {/* Información de estructura */}
                                                    {archivo.estructura && (
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-xs">
                                                                {getEstructuraInfo(archivo.estructura, archivo.subcategoria, archivo.nombre, archivo.categoria).icon}
                                                            </span>
                                                            <span className={`text-xs ml-1 ${getEstructuraInfo(archivo.estructura, archivo.subcategoria, archivo.nombre, archivo.categoria).color}`}>
                                                                {getEstructuraInfo(archivo.estructura, archivo.subcategoria, archivo.nombre, archivo.categoria).label}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Botones de acción para documentos regulares */}
                                        <div className="flex items-center space-x-1 mb-3">
                                            <button 
                                                onClick={() => handleViewFile(archivo)}
                                                className="text-gray-400 hover:text-blue-600"
                                                title="Ver archivo"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    // Descargar archivo usando SAS URL - FORZAR DESCARGA
                                                    const downloadUrl = archivo.documentMetadata?.sasUrl || archivo.url;
                                                    if (downloadUrl) {
                                                        console.log(`📥 Descargando archivo: ${archivo.nombre} desde ${downloadUrl}`);
                                                        
                                                        // Método 1: Fetch + Blob para forzar descarga
                                                        fetch(downloadUrl)
                                                            .then(response => {
                                                                if (!response.ok) {
                                                                    throw new Error('Error en la descarga');
                                                                }
                                                                return response.blob();
                                                            })
                                                            .then(blob => {
                                                                // Crear URL temporal del blob
                                                                const blobUrl = window.URL.createObjectURL(blob);
                                                                const link = document.createElement('a');
                                                                link.href = blobUrl;
                                                                link.download = archivo.nombre;
                                                                link.style.display = 'none';
                                                                
                                                                // Agregar al DOM, hacer clic, y limpiar
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                                
                                                                // Limpiar URL temporal después de un momento
                                                                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
                                                            })
                                                            .catch(error => {
                                                                console.error('❌ Error al descargar:', error);
                                                                // Fallback: método tradicional si fetch falla
                                                                const link = document.createElement('a');
                                                                link.href = downloadUrl;
                                                                link.download = archivo.nombre;
                                                                link.target = '_blank';
                                                                link.rel = 'noopener noreferrer';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            });
                                                } else {
                                                    console.error('❌ No hay URL de descarga disponible para:', archivo.nombre);
                                                    alert('No hay URL de descarga disponible para este archivo');
                                                }
                                            }}
                                            className="text-gray-400 hover:text-green-600"
                                            title="Descargar archivo"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteFile(archivo.id, archivo.nombre)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    </>
                )}
                
                
                {/* Resumen y estadísticas */}
                {!isLoading && (
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">📊 Estadísticas de archivos</h3>
                        
                        {(() => {
                            // Usar archivos filtrados para estadísticas cuando hay filtros activos
                            const archivosParaStats = (estructuraFiltro !== "todas" || subcategoriaFiltro !== "todas" || searchTerm !== "") 
                                ? archivosFiltrados 
                                : archivos;
                            
                            return archivosParaStats.length > 0 ? (
                                <>
                                    {/* Estadísticas generales */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-indigo-600">{archivosParaStats.length}</div>
                                            <div className="text-sm text-gray-500">Total de archivos</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatFileSize(archivosParaStats.reduce((total, archivo) => total + archivo.tamaño, 0))}
                                            </div>
                                            <div className="text-sm text-gray-500">Espacio utilizado</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {new Set(archivosParaStats.map(a => a.tipo)).size}
                                            </div>
                                            <div className="text-sm text-gray-500">Tipos de archivo</div>
                                        </div>
                                    </div>

                                    {/* Estadísticas de estructura de documentos */}
                                    <div className="border-t pt-4">
                                        <h4 className="text-md font-medium mb-3 text-gray-700">Clasificación por estructura</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {archivosParaStats.filter(a => a.estructura === ESTRUCTURA_DOCUMENTOS.ESTRUCTURADO).length}
                                                </div>
                                                <div className="text-sm text-green-700 font-medium">📊 Estructurado</div>
                                                <div className="text-xs text-green-600 mt-1">
                                                    CSV, JSON, XML, Bases de datos
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {archivosParaStats.filter(a => a.estructura === ESTRUCTURA_DOCUMENTOS.SEMI_ESTRUCTURADO).length}
                                                </div>
                                                <div className="text-sm text-blue-700 font-medium">📋 Semi-estructurado</div>
                                                <div className="text-xs text-blue-600 mt-1">
                                                    Facturas, Certificados, Formularios
                                                </div>
                                            </div>
                                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {archivosParaStats.filter(a => a.estructura === ESTRUCTURA_DOCUMENTOS.NO_ESTRUCTURADO).length}
                                                </div>
                                                <div className="text-sm text-orange-700 font-medium">📄 No estructurado</div>
                                                <div className="text-xs text-orange-600 mt-1">
                                                    Contratos, Reportes, Emails
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                        ) : (
                            /* Estadísticas vacías cuando no hay archivos */
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-400">0</div>
                                        <div className="text-sm text-gray-500">Total de archivos</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-400">0 Bytes</div>
                                        <div className="text-sm text-gray-500">Espacio utilizado</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-400">0</div>
                                        <div className="text-sm text-gray-500">Tipos de archivo</div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-md font-medium mb-3 text-gray-700">Clasificación por estructura</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-400">0</div>
                                            <div className="text-sm text-gray-600 font-medium">📊 Estructurado</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                CSV, JSON, XML, Bases de datos
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-400">0</div>
                                            <div className="text-sm text-gray-600 font-medium">📋 Semi-estructurado</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Facturas, Certificados, Formularios
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-400">0</div>
                                            <div className="text-sm text-gray-600 font-medium">📄 No estructurado</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Contratos, Reportes, Emails
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700 text-center">
                                        📈 Las estadísticas se actualizarán automáticamente al subir documentos
                                    </p>
                                </div>
                            </>
                        );
                        })()}
                    </div>
                )}

                {/* Modal de Estadísticas del Archivo Procesado */}
                {mostrarEstadisticasArchivo && datosArchivoProcesado && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold flex items-center">
                                    📊 Estadísticas del Archivo Procesado
                                </h3>
                                <button
                                    onClick={handleCloseEstadisticasModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Información básica del archivo */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-green-800">¡Upload Exitoso!</h4>
                                            <p className="text-green-600">El archivo ha sido procesado correctamente</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalles del archivo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-blue-800 mb-2">📄 Información del Archivo</h5>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Nombre:</span> {datosArchivoProcesado.fileName || 'N/A'}</div>
                                            <div><span className="font-medium">Tamaño:</span> {datosArchivoProcesado.fileSize ? `${(datosArchivoProcesado.fileSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                                            <div><span className="font-medium">Tipo MIME:</span> {datosArchivoProcesado.mimeType || 'N/A'}</div>
                                            <div><span className="font-medium">Tipo de documento:</span> {datosArchivoProcesado.documentType || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-purple-800 mb-2">🚀 Información de Procesamiento</h5>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Estado:</span> {datosArchivoProcesado.success ? '✅ Exitoso' : '❌ Error'}</div>
                                            <div><span className="font-medium">Ubicación:</span> {datosArchivoProcesado.filePath || 'N/A'}</div>
                                            <div><span className="font-medium">Container:</span> {datosArchivoProcesado.containerName || 'N/A'}</div>
                                            <div><span className="font-medium">Tiempo de procesamiento:</span> {datosArchivoProcesado.processingTimeSeconds ? `${datosArchivoProcesado.processingTimeSeconds}s` : 'N/A'}</div>
                                            <div><span className="font-medium">Subido el:</span> {datosArchivoProcesado.uploadedAt ? new Date(datosArchivoProcesado.uploadedAt).toLocaleString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadatos si existen */}
                                {datosArchivoProcesado.metadata && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-800 mb-2">🔍 Metadatos</h5>
                                        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                                            {JSON.stringify(datosArchivoProcesado.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* DEBUG: Mostrar toda la respuesta */}
                                <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                                    <h5 className="font-semibold text-gray-800 mb-2">🔧 DEBUG: Respuesta Completa del Backend</h5>
                                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-60">
                                        {JSON.stringify(datosArchivoProcesado, null, 2)}
                                    </pre>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Esta sección muestra todos los datos recibidos del backend para depuración
                                    </p>
                                </div>

                                {/* Mensaje del procesamiento */}
                                {datosArchivoProcesado.message && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-yellow-800 mb-2">💬 Mensaje del Sistema</h5>
                                        <p className="text-yellow-700">{datosArchivoProcesado.message}</p>
                                    </div>
                                )}

                                {/* Mensaje de error si existe */}
                                {datosArchivoProcesado.errorMessage && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-red-800 mb-2">❌ Error</h5>
                                        <p className="text-red-700">{datosArchivoProcesado.errorMessage}</p>
                                    </div>
                                )}

                                {/* URL del archivo si está disponible */}
                                {datosArchivoProcesado.url && (
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-indigo-800 mb-2">🔗 Acceso al Archivo</h5>
                                        <a 
                                            href={datosArchivoProcesado.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 underline text-sm break-all"
                                        >
                                            Ver archivo procesado
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Botón de cerrar */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleCloseEstadisticasModal}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArchivosPersonalesPage;
