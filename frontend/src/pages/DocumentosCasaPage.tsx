import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAgentCreateHome, HomeData } from '@/services/casaAgentApiService';
import { 
    ArrowLeft, 
    FileText,
    Shield,
    Home,
    Clipboard,
    Receipt,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    Plus,
    Cloud,
    FileImage,
    FileCheck,
    CreditCard,
    RefreshCw,
    Search,
    ChevronDown,
    ChevronUp,
    Brain,
    Zap,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentType {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    borderColor: string;
    acceptedFiles: string;
    endpoint: string;
    files: DocumentFile[];
}

interface DocumentFile {
    id: string;
    name: string;
    url: string;
    uploadDate: string;
    size: string;
    type: string;
}

interface MortgageStatement {
    id?: string;
    TwinID?: string;
    homeId?: string;
    fileName?: string;
    filePath?: string;
    containerName?: string;
    documentUrl?: string;
    htmlReport: string;
    jsonData: {
        reporteEstadoCuentaHipotecario: {
            informacionEstadoCuenta: {
                statementDate: string;
                loanNumber: string;
                totalAmountDue: string;
                lateCharge: string;
                propertyAddress: string;
            };
            // ... otros campos si los necesitas
        };
    };
    aiAnalysisResultJson?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
    type?: string;
}

const DocumentosCasaPage: React.FC = () => {
    const { houseId } = useParams<{ houseId: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const { obtenerCasaPorId, subirSeguroCasa, subirHipotecaCasa, obtenerListaHipotecas } = useAgentCreateHome();
    
    const [casa, setCasa] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
    const [mortgageStatements, setMortgageStatements] = useState<MortgageStatement[]>([]);
    const [selectedMortgageStatement, setSelectedMortgageStatement] = useState<MortgageStatement | null>(null);
    const [showMortgageModal, setShowMortgageModal] = useState(false);
    const [refreshingMortgages, setRefreshingMortgages] = useState(false);
    
    // Estados para selección múltiple y reportes
    const [selectedMortgageIds, setSelectedMortgageIds] = useState<string[]>([]);
    const [generatingExecutiveReport, setGeneratingExecutiveReport] = useState(false);
    const [showExecutiveReportModal, setShowExecutiveReportModal] = useState(false);
    
    // Estados para el modal de progreso de procesamiento
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState('');
    const [processingFiles, setProcessingFiles] = useState<string[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [executiveReportContent, setExecutiveReportContent] = useState<string>('');
    
    // Estado para modo de vista (compacto vs expandido)
    const [mortgageViewMode, setMortgageViewMode] = useState<'compact' | 'expanded'>('compact');
    
    // Estados para el combobox con search
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const twinId = accounts[0]?.localAccountId;

    // Inicializar tipos de documentos
    useEffect(() => {
        const initialDocTypes: DocumentType[] = [
            {
                id: 'insurance',
                title: 'Seguro de Casa',
                description: 'Póliza de seguro, coberturas y documentos relacionados',
                icon: Shield,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                acceptedFiles: '.pdf,.doc,.docx,image/*',
                endpoint: 'upload-home-insurance',
                files: []
            },
        {
            id: 'title',
            title: 'Título de Propiedad',
            description: 'Escrituras, títulos y documentos de propiedad',
            icon: FileText,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-property-title',
            files: []
        },
        {
            id: 'mortgage',
            title: 'Hipoteca',
            description: 'Documentos de hipoteca, préstamos y financiamiento',
            icon: CreditCard,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-home-mortgage',
            files: []
        },
        {
            id: 'inspection',
            title: 'Inspecciones',
            description: 'Reportes de inspección, evaluaciones y certificaciones',
            icon: Clipboard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-inspection',
            files: []
        },
        {
            id: 'receipts',
            title: 'Facturas y Recibos',
            description: 'Facturas de servicios, mejoras y mantenimiento',
            icon: Receipt,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            acceptedFiles: '.pdf,.doc,.docx,image/*',
            endpoint: 'upload-receipts',
            files: []
        }
        ];

        setDocumentTypes(initialDocTypes);
    }, []);

    // Cargar información de la casa
    useEffect(() => {
        const cargarCasa = async () => {
            if (!twinId || !houseId) {
                setLoading(false);
                return;
            }

            try {
                const casaEncontrada = await obtenerCasaPorId(twinId, houseId);
                setCasa(casaEncontrada || null);
            } catch (error) {
                console.error('Error al cargar casa:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCasa();
    }, [twinId, houseId, obtenerCasaPorId]);

    // Poblar archivos existentes cuando se carga la casa o hipotecas
    useEffect(() => {
        if (casa && casa.aiAnalysis?.homeInsurance) {
            setDocumentTypes(prev => prev.map(docType => {
                if (docType.id === 'insurance') {
                    return {
                        ...docType,
                        files: [{
                            id: 'home-insurance-analysis',
                            name: 'Análisis de Seguro de Casa',
                            url: '', // El contenido está en casa.aiAnalysis.homeInsurance
                            uploadDate: new Date().toLocaleDateString(),
                            size: 'Análisis AI',
                            type: 'html'
                        }]
                    };
                }
                return docType;
            }));
        }

        // Poblar archivos de hipoteca
        if (mortgageStatements.length > 0) {
            console.log('📊 Populando archivos de hipoteca:', mortgageStatements);
            setDocumentTypes(prev => prev.map(docType => {
                if (docType.id === 'mortgage') {
                    const mortgageFiles = mortgageStatements.map((stmt, index) => {
                        const fileId = stmt.id || `mortgage-${index}`;
                        const file = {
                            id: fileId,
                            name: `Statement ${stmt.jsonData?.reporteEstadoCuentaHipotecario?.informacionEstadoCuenta?.statementDate || stmt.fileName || `#${index + 1}`}`,
                            url: stmt.documentUrl || '',
                            uploadDate: stmt.fechaCreacion ? new Date(stmt.fechaCreacion).toLocaleDateString() : new Date().toLocaleDateString(),
                            size: 'Statement HTML',
                            type: 'mortgage-statement'
                        };
                        console.log('📄 Archivo de hipoteca generado:', file);
                        return file;
                    });

                    return {
                        ...docType,
                        files: mortgageFiles
                    };
                }
                return docType;
            }));
        }
    }, [casa, mortgageStatements]);

    // Cargar lista de hipotecas
    useEffect(() => {
        const cargarHipotecas = async () => {
            if (!twinId || !houseId) return;

            try {
                const hipotecas = await obtenerListaHipotecas(twinId, houseId);
                setMortgageStatements(hipotecas || []);
                
                // Si no hay hipotecas, limpiar también las selecciones del combo
                if (!hipotecas || hipotecas.length === 0) {
                    setSelectedMortgageIds([]);
                    setSearchTerm('');
                    setIsDropdownOpen(false);
                    console.log('🧹 Lista de hipotecas vacía en carga inicial - limpiando selecciones');
                }
                
                console.log('📋 Hipotecas cargadas:', hipotecas);
            } catch (error) {
                console.error('Error al cargar hipotecas:', error);
                // En caso de error, también limpiar selecciones
                setSelectedMortgageIds([]);
                setSearchTerm('');
                setIsDropdownOpen(false);
            }
        };

        cargarHipotecas();
    }, [twinId, houseId, obtenerListaHipotecas]);

    // Manejar tecla ESC para cerrar modales
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowViewModal(false);
                setShowMortgageModal(false);
                setIsDropdownOpen(false);
            }
        };

        if (showViewModal || showMortgageModal || isDropdownOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showViewModal, showMortgageModal, isDropdownOpen]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Manejar upload de documentos
    const handleUploadDocument = async (docType: DocumentType, files: FileList) => {
        if (!twinId || !houseId) return;

        setUploadingDoc(docType.id);
        
        // Si es hipoteca, mostrar modal de progreso profesional
        if (docType.id === 'mortgage') {
            setProcessingFiles(Array.from(files).map(f => f.name));
            setCurrentFileIndex(0);
            setProcessingProgress(0);
            setProcessingStep('Inicializando análisis...');
            setShowProcessingModal(true);
        }
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`📄 Subiendo ${docType.title}:`, file.name);
                
                if (docType.id === 'mortgage') {
                    // Actualizar progreso para hipotecas
                    setCurrentFileIndex(i);
                    
                    // Paso 1: Preparando archivo
                    setProcessingStep('📄 Preparando archivo para análisis...');
                    setProcessingProgress(10 + (i * 80 / files.length));
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Paso 2: Extrayendo datos
                    setProcessingStep('🔍 Extrayendo datos del estado de cuenta...');
                    setProcessingProgress(20 + (i * 80 / files.length));
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // Paso 3: Análisis con AI
                    setProcessingStep('🤖 Realizando análisis financiero con IA...');
                    setProcessingProgress(40 + (i * 80 / files.length));
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    
                    // Paso 4: Subida real
                    setProcessingStep('☁️ Guardando análisis en la nube...');
                    setProcessingProgress(70 + (i * 80 / files.length));
                    await subirHipotecaCasa(twinId, houseId, file);
                    
                    // Finalizar archivo
                    setProcessingStep(`✅ Archivo ${i + 1} de ${files.length} completado`);
                    setProcessingProgress(80 + ((i + 1) * 20 / files.length));
                    await new Promise(resolve => setTimeout(resolve, 300));
                } else if (docType.id === 'insurance') {
                    await subirSeguroCasa(twinId, houseId, file);
                }
                // TODO: Implementar otros tipos de documentos
            }

            if (docType.id === 'mortgage') {
                setProcessingStep('🎉 ¡Análisis completado! Preparando vista...');
                setProcessingProgress(100);
                await new Promise(resolve => setTimeout(resolve, 800));
                setShowProcessingModal(false);
            }

            alert(`✅ ${docType.title} subido exitosamente`);
        } catch (error) {
            console.error('Error al subir documento:', error);
            if (docType.id === 'mortgage') {
                setShowProcessingModal(false);
            }
            alert(`❌ Error al subir ${docType.title}`);
        } finally {
            setUploadingDoc(null);
        }
    };

    // Manejar drag and drop
    const handleDragOver = (e: React.DragEvent, docTypeId: string) => {
        e.preventDefault();
        setDraggedOver(docTypeId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggedOver(null);
    };

    const handleDrop = (e: React.DragEvent, docType: DocumentType) => {
        e.preventDefault();
        setDraggedOver(null);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUploadDocument(docType, files);
        }
    };

    // Abrir selector de archivos
    const openFileSelector = (docType: DocumentType) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = docType.acceptedFiles;
        
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                handleUploadDocument(docType, files);
            }
        };
        
        input.click();
    };

    // Función para ver archivos
    const handleViewFile = (file: DocumentFile) => {
        if (file.type === 'mortgage-statement') {
            // Buscar el statement correspondiente
            let statement = mortgageStatements.find(stmt => stmt.id === file.id);
            
            // Si no encuentra por ID, buscar por índice para IDs generados
            if (!statement && file.id.startsWith('mortgage-')) {
                const index = parseInt(file.id.replace('mortgage-', ''));
                statement = mortgageStatements[index];
            }
            
            if (statement) {
                console.log('📄 Abriendo statement de hipoteca:', statement);
                setSelectedMortgageStatement(statement);
                setShowMortgageModal(true);
            } else {
                console.error('❌ No se encontró el statement de hipoteca para:', file);
            }
        } else {
            setSelectedFile(file);
            setShowViewModal(true);
        }
    };

    // Función para refrescar hipotecas
    const handleRefreshMortgages = async () => {
        if (!twinId || !houseId) return;

        setRefreshingMortgages(true);
        try {
            console.log('🔄 Refrescando lista de hipotecas...');
            const hipotecas = await obtenerListaHipotecas(twinId, houseId);
            setMortgageStatements(hipotecas || []);
            
            // Si no hay hipotecas, limpiar también las selecciones del combo
            if (!hipotecas || hipotecas.length === 0) {
                setSelectedMortgageIds([]);
                setSearchTerm('');
                setIsDropdownOpen(false);
                console.log('🧹 Lista de hipotecas vacía - limpiando selecciones');
            }
            
            console.log('✅ Hipotecas refrescadas:', hipotecas);
        } catch (error) {
            console.error('❌ Error al refrescar hipotecas:', error);
            alert('Error al refrescar los estados de cuenta de hipoteca');
        } finally {
            setRefreshingMortgages(false);
        }
    };

    // Función para manejar selección de checkboxes
    const handleMortgageSelection = (mortgageId: string, checked: boolean) => {
        setSelectedMortgageIds(prev => {
            if (checked) {
                return [...prev, mortgageId];
            } else {
                return prev.filter(id => id !== mortgageId);
            }
        });
    };

    // Función para seleccionar todos
    const handleSelectAllMortgages = (checked: boolean) => {
        if (checked) {
            const allIds = getMortgageFilesForCombo().map(file => file.id);
            setSelectedMortgageIds(allIds);
        } else {
            setSelectedMortgageIds([]);
        }
    };

    // Función para generar reporte ejecutivo con grid de datos
    const generateExecutiveReportWithGrid = (selectedStatements: MortgageStatement[]): string => {
        console.log('🔍 DEBUG - selectedStatements:', selectedStatements);
        console.log('🔍 DEBUG - selectedStatements.length:', selectedStatements.length);
        
        if (selectedStatements.length > 0) {
            console.log('🔍 DEBUG - Primer statement:', selectedStatements[0]);
            console.log('🔍 DEBUG - jsonData del primer statement:', selectedStatements[0].jsonData);
            console.log('🔍 DEBUG - mortgageStatementReport:', selectedStatements[0].mortgageStatementReport);
        }
        
        // Extraer y procesar datos de cada statement
        const processedData = selectedStatements.map((stmt, index) => {
            // Acceder a la estructura real de datos usando camelCase (no MAYÚSCULAS)
            const reporteCompleto = stmt.jsonData?.reporteEstadoCuentaHipotecario as any;
            const infoEstado = reporteCompleto?.informacionEstadoCuenta;
            const resumenSaldo = reporteCompleto?.resumenSaldo;
            const desglosePagos = reporteCompleto?.desglosePagosAnteriores;
            const explicacionMonto = reporteCompleto?.explicacionMontoAdeudado;
            
            // Convertir strings a números para cálculos - usando claves camelCase reales
            const totalDue = parseFloat(infoEstado?.totalAmountDue?.replace(/[$,]/g, '') || '0');
            const lateCharge = infoEstado?.lateCharge === "No especificado" ? 0 : parseFloat(infoEstado?.lateCharge?.replace(/[$,]/g, '') || '0');
            
            // Datos del resumen del saldo (camelCase)
            const unpaidPrincipalBalance = parseFloat(resumenSaldo?.unpaidPrincipalBalance?.replace(/[$,]/g, '') || '0');
            const escrowBalance = parseFloat(resumenSaldo?.escrowBalance?.replace(/[$,]/g, '') || '0');
            const interestRate = resumenSaldo?.interestRate || 'N/A';
            const maturityDate = resumenSaldo?.maturityDate || 'N/A';
            
            // Obtener datos del pago actual y desglose (camelCase real)
            const currentPayment = parseFloat(explicacionMonto?.currentPayment?.replace(/[$,]/g, '') || '0');
            const principal = parseFloat(explicacionMonto?.principal?.replace(/[$,]/g, '') || '0');
            const interest = parseFloat(explicacionMonto?.interest?.replace(/[$,]/g, '') || '0');
            const escrow = parseFloat(explicacionMonto?.escrow?.replace(/[$,]/g, '') || '0');
            
            // Datos del año hasta la fecha (camelCase real)
            const ytdPrincipal = parseFloat(desglosePagos?.yearToDatePrincipal?.replace(/[$,]/g, '') || '0');
            const ytdInterest = parseFloat(desglosePagos?.yearToDateInterest?.replace(/[$,]/g, '') || '0');
            const ytdEscrow = parseFloat(desglosePagos?.yearToDateEscrow?.replace(/[$,]/g, '') || '0');
            
            // Pagos desde el último estado (camelCase real)
            const sinceLastPrincipal = parseFloat(desglosePagos?.sinceLastStatementPrincipal?.replace(/[$,]/g, '') || '0');
            const sinceLastInterest = parseFloat(desglosePagos?.sinceLastStatementInterest?.replace(/[$,]/g, '') || '0');
            const sinceLastEscrow = parseFloat(desglosePagos?.sinceLastStatementEscrow?.replace(/[$,]/g, '') || '0');
            
            return {
                index: index + 1,
                statementDate: infoEstado?.statementDate || 'N/A',
                loanNumber: infoEstado?.loanNumber || 'N/A',
                totalAmountDue: totalDue,
                lateCharge: lateCharge,
                propertyAddress: infoEstado?.propertyAddress || 'N/A',
                fileName: stmt.fileName || `Statement ${index + 1}`,
                
                // Resumen del saldo (datos base)
                unpaidPrincipalBalance: unpaidPrincipalBalance,
                escrowBalance: escrowBalance,
                interestRate: interestRate,
                maturityDate: maturityDate,
                
                // Datos del pago actual (mensuales)
                currentPayment: currentPayment,
                principal: principal,
                interest: interest,
                escrow: escrow,
                
                // Pagos desde último estado (mes actual)
                sinceLastPrincipal: sinceLastPrincipal,
                sinceLastInterest: sinceLastInterest,
                sinceLastEscrow: sinceLastEscrow,
                
                // Datos año hasta la fecha (acumulados)
                ytdPrincipal: ytdPrincipal,
                ytdInterest: ytdInterest,
                ytdEscrow: ytdEscrow
            };
        });

        // Calcular totales y estadísticas
        const totalAmountDue = processedData.reduce((sum, item) => sum + item.totalAmountDue, 0);
        const totalLateCharges = processedData.reduce((sum, item) => sum + item.lateCharge, 0);
        const averagePayment = processedData.reduce((sum, item) => sum + item.currentPayment, 0) / processedData.length;
        
        // Saldos principales actuales
        const totalUnpaidPrincipal = processedData.reduce((sum, item) => sum + item.unpaidPrincipalBalance, 0);
        const averageUnpaidPrincipal = totalUnpaidPrincipal / processedData.length;
        const totalEscrowBalance = processedData.reduce((sum, item) => sum + item.escrowBalance, 0);
        
        // Pagos del mes actual (Since Last Statement)
        const totalSinceLastPrincipal = processedData.reduce((sum, item) => sum + item.sinceLastPrincipal, 0);
        const totalSinceLastInterest = processedData.reduce((sum, item) => sum + item.sinceLastInterest, 0);
        const totalSinceLastEscrow = processedData.reduce((sum, item) => sum + item.sinceLastEscrow, 0);

        // Totales del año hasta la fecha
        const totalYTDPrincipal = processedData.reduce((sum, item) => sum + item.ytdPrincipal, 0);
        const totalYTDInterest = processedData.reduce((sum, item) => sum + item.ytdInterest, 0);
        const totalYTDEscrow = processedData.reduce((sum, item) => sum + item.ytdEscrow, 0);
        
        // Para compatibilidad con el resto del código (usando datos mensuales)
        const totalPrincipal = totalSinceLastPrincipal;
        const totalInterest = totalSinceLastInterest;
        const totalEscrow = totalSinceLastEscrow;

        // Ordenar por fecha para análisis de tendencias
        const sortedData = [...processedData].sort((a, b) => 
            new Date(a.statementDate).getTime() - new Date(b.statementDate).getTime()
        );

        // Generar HTML del reporte ejecutivo
        return `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background: #ffffff; color: #333;">
                <!-- Header Principal -->
                <div style="text-align: center; margin-bottom: 40px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
                    <h1 style="margin: 0; font-size: 2.2em; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                        📊 Reporte Ejecutivo de Hipoteca
                    </h1>
                    <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9;">
                        Análisis Consolidado de ${selectedStatements.length} Estados de Cuenta
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 0.95em; opacity: 0.8;">
                        Generado el ${new Date().toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

                <!-- Resumen Ejecutivo -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; border-bottom: 3px solid #4299e1; padding-bottom: 10px; margin-bottom: 20px;">
                        📈 Resumen Ejecutivo
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); padding: 15px; border-radius: 12px; border-left: 5px solid #38b2ac;">
                            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 1em;">💰 Total Adeudado</h3>
                            <p style="margin: 0; font-size: 1.5em; font-weight: bold; color: #319795;">
                                $${totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); padding: 15px; border-radius: 12px; border-left: 5px solid #e53e3e;">
                            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 1em;">⚠️ Cargos por Retraso</h3>
                            <p style="margin: 0; font-size: 1.5em; font-weight: bold; color: #c53030;">
                                $${totalLateCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); padding: 15px; border-radius: 12px; border-left: 5px solid #3182ce;">
                            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 1em;">📅 Pago Promedio</h3>
                            <p style="margin: 0; font-size: 1.5em; font-weight: bold; color: #2b6cb0;">
                                $${averagePayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%); padding: 15px; border-radius: 12px; border-left: 5px solid #805ad5;">
                            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 1em;">� Principal Total</h3>
                            <p style="margin: 0; font-size: 1.5em; font-weight: bold; color: #6b46c1;">
                                $${totalPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); padding: 15px; border-radius: 12px; border-left: 5px solid #f56565;">
                            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 1em;">💸 Intereses Total</h3>
                            <p style="margin: 0; font-size: 1.5em; font-weight: bold; color: #e53e3e;">
                                $${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); padding: 15px; border-radius: 12px; border-left: 5px solid #48bb78;">
                            <h3 style="margin: 0 0 8px 0; color: #2d3748; font-size: 1em;">🏠 Escrow Total</h3>
                            <p style="margin: 0; font-size: 1.5em; font-weight: bold; color: #38a169;">
                                $${totalEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Tabla Detallada -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; border-bottom: 3px solid #48bb78; padding-bottom: 10px; margin-bottom: 20px;">
                        📋 Análisis Detallado por Período
                    </h2>
                    <div style="overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 12px;">
                        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; font-size: 0.9em;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white;">
                                    <th style="padding: 12px 8px; text-align: left; font-weight: 600;">#</th>
                                    <th style="padding: 12px 8px; text-align: left; font-weight: 600;">📅 Fecha</th>
                                    <th style="padding: 12px 8px; text-align: left; font-weight: 600;">🔢 Préstamo</th>
                                    <th style="padding: 12px 8px; text-align: right; font-weight: 600;">💰 Total Adeudado</th>
                                    <th style="padding: 12px 8px; text-align: right; font-weight: 600;">💵 Pago Actual</th>
                                    <th style="padding: 12px 8px; text-align: right; font-weight: 600;">🏦 Principal</th>
                                    <th style="padding: 12px 8px; text-align: right; font-weight: 600;">💸 Intereses</th>
                                    <th style="padding: 12px 8px; text-align: right; font-weight: 600;">� Escrow</th>
                                    <th style="padding: 12px 8px; text-align: right; font-weight: 600;">⚠️ Retraso</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedData.map((item, index) => `
                                    <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 0 ? 'background: #f7fafc;' : 'background: white;'}">
                                        <td style="padding: 10px 8px; font-weight: 600; color: #4a5568;">${item.index}</td>
                                        <td style="padding: 10px 8px; color: #2d3748; font-weight: 500; font-size: 0.85em;">${item.statementDate}</td>
                                        <td style="padding: 10px 8px; color: #4a5568; font-family: monospace; font-size: 0.8em;">${item.loanNumber.substring(0, 12)}${item.loanNumber.length > 12 ? '...' : ''}</td>
                                        <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: ${item.totalAmountDue > averagePayment * 1.1 ? '#e53e3e' : '#2d3748'};">
                                            $${item.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #2b6cb0;">
                                            $${item.currentPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #6b46c1;">
                                            $${item.principal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #e53e3e;">
                                            $${item.interest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #38a169;">
                                            $${item.escrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: ${item.lateCharge > 0 ? '#e53e3e' : '#38a169'};">
                                            $${item.lateCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%); font-weight: bold;">
                                    <td colspan="3" style="padding: 12px 8px; color: #2d3748; font-size: 1em;">📊 TOTALES</td>
                                    <td style="padding: 12px 8px; text-align: right; color: #2d3748; font-size: 1em;">
                                        $${totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: right; color: #2b6cb0; font-size: 1em;">
                                        $${(processedData.reduce((sum, item) => sum + item.currentPayment, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: right; color: #6b46c1; font-size: 1em;">
                                        $${totalPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: right; color: #e53e3e; font-size: 1em;">
                                        $${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: right; color: #38a169; font-size: 1em;">
                                        $${totalEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: right; color: #e53e3e; font-size: 1em;">
                                        $${totalLateCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <!-- Análisis del Mes Actual -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; border-bottom: 3px solid #9f7aea; padding-bottom: 10px; margin-bottom: 20px;">
                        📆 Análisis del Mes Actual (Since Last Statement)
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #6b46c1;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">🏦 Principal Mes Actual</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #6b46c1;">
                                $${totalSinceLastPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #e53e3e;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">💸 Intereses Mes Actual</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #e53e3e;">
                                $${totalSinceLastInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #38a169;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">🏠 Escrow Mes Actual</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #38a169;">
                                $${totalSinceLastEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Información de Saldos y Tasas -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; border-bottom: 3px solid #ed8936; padding-bottom: 10px; margin-bottom: 20px;">
                        📊 Resumen de Saldos y Tasas
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #f59e0b;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">🏠 Saldo Principal Total</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #d97706;">
                                $${totalUnpaidPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #3b82f6;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">💰 Saldo Escrow Total</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #2563eb;">
                                $${totalEscrowBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #fefce8 0%, #fef08a 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #eab308;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">📈 Tasa de Interés</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #ca8a04;">
                                ${processedData.length > 0 ? processedData[0].interestRate : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Análisis Año hasta la Fecha -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; border-bottom: 3px solid #ed8936; padding-bottom: 10px; margin-bottom: 20px;">
                        📊 Análisis Año hasta la Fecha (YTD)
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #6b46c1;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">🏦 Principal YTD</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #6b46c1;">
                                $${totalYTDPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #e53e3e;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">💸 Intereses YTD</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #e53e3e;">
                                $${totalYTDInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #38a169;">
                            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 1.1em;">🏠 Escrow YTD</h3>
                            <p style="margin: 0; font-size: 1.6em; font-weight: bold; color: #38a169;">
                                $${totalYTDEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Análisis de Tendencias -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #2d3748; border-bottom: 3px solid #ed8936; padding-bottom: 10px; margin-bottom: 20px;">
                        📈 Análisis de Tendencias
                    </h2>
                    <div style="background: linear-gradient(135deg, #fffaf0 0%, #feebc8 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #ed8936;">
                        ${(() => {
                            if (sortedData.length < 2) return '<p>Se necesitan al menos 2 estados de cuenta para análisis de tendencias.</p>';
                            
                            const firstAmount = sortedData[0].totalAmountDue;
                            const lastAmount = sortedData[sortedData.length - 1].totalAmountDue;
                            const trend = lastAmount > firstAmount ? 'aumentado' : 'disminuido';
                            const trendColor = trend === 'aumentado' ? '#e53e3e' : '#38a169';
                            const trendIcon = trend === 'aumentado' ? '📈' : '📉';
                            const difference = Math.abs(lastAmount - firstAmount);
                            
                            const avgInterestToPrincipal = totalInterest / totalPrincipal * 100;
                            
                            return `
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                                    <div>
                                        <h3 style="margin: 0 0 15px 0; color: #2d3748;">💡 Observaciones Clave:</h3>
                                        <ul style="margin: 0; padding-left: 20px; color: #4a5568; line-height: 1.6;">
                                            <li>El monto adeudado ha <strong style="color: ${trendColor};">${trend}</strong> en $${difference.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${trendIcon}</li>
                                            <li>Promedio de cargos por retraso: <strong>$${(totalLateCharges / selectedStatements.length).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></li>
                                            <li>Pago mensual promedio: <strong>$${averagePayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></li>
                                            <li>Ratio Interés/Principal: <strong>${avgInterestToPrincipal.toFixed(1)}%</strong></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 style="margin: 0 0 15px 0; color: #2d3748;">🎯 Recomendaciones:</h3>
                                        <ul style="margin: 0; padding-left: 20px; color: #4a5568; line-height: 1.6;">
                                            ${totalLateCharges > 0 ? '<li>🚨 <strong>Atención:</strong> Se detectaron cargos por retraso. Considere establecer pagos automáticos.</li>' : '<li>✅ <strong>Excelente:</strong> No se registraron cargos por retraso en el período analizado.</li>'}
                                            ${avgInterestToPrincipal > 120 ? '<li>� <strong>Oportunidad:</strong> El ratio interés/principal es alto. Considere pagos adicionales al principal.</li>' : '<li>👍 <strong>Bueno:</strong> El ratio interés/principal está en rango normal.</li>'}
                                            <li>� Total pagado este período: <strong>$${(totalPrincipal + totalInterest + totalEscrow).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></li>
                                        </ul>
                                    </div>
                                </div>
                            `;
                        })()}
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f7fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #4a5568; font-size: 0.9em;">
                        📋 Reporte generado automáticamente por TwinAgent • 
                        🕒 ${new Date().toLocaleString('es-ES')} • 
                        📊 Basado en ${selectedStatements.length} estado(s) de cuenta
                    </p>
                    <p style="margin: 10px 0 0 0; color: #718096; font-size: 0.8em;">
                        Este reporte es solo para fines informativos. Consulte con un profesional financiero para decisiones importantes.
                    </p>
                </div>
            </div>
        `;
    };

    // Función para manejar la generación del reporte ejecutivo
    const handleGenerateExecutiveReport = async () => {
        if (selectedMortgageIds.length === 0) {
            alert('Por favor selecciona al menos un estado de cuenta');
            return;
        }

        setGeneratingExecutiveReport(true);
        try {
            console.log('🔄 Generando reporte ejecutivo para IDs:', selectedMortgageIds);
            console.log('🔍 DEBUG - mortgageStatements disponibles:', mortgageStatements);
            
            // Debug: mostrar IDs de mortgageStatements vs selectedMortgageIds
            console.log('🔍 DEBUG - IDs en mortgageStatements:');
            mortgageStatements.forEach((stmt, index) => {
                const stmtId = stmt.id || `mortgage-${index}`;
                console.log(`  Statement ${index}: ID=${stmtId}`);
            });
            console.log('🔍 DEBUG - IDs seleccionados:', selectedMortgageIds);
            
            // Obtener los statements seleccionados
            const selectedStatements = mortgageStatements.filter(stmt => 
                selectedMortgageIds.includes(stmt.id || `mortgage-${mortgageStatements.indexOf(stmt)}`)
            );
            
            console.log('📊 Statements seleccionados para reporte:', selectedStatements);
            
            // Generar el reporte ejecutivo con grid
            const reportHtml = generateExecutiveReportWithGrid(selectedStatements);
            
            setExecutiveReportContent(reportHtml);
            setShowExecutiveReportModal(true);
            
            console.log('✅ Reporte ejecutivo generado exitosamente');
            
        } catch (error) {
            console.error('❌ Error al generar reporte ejecutivo:', error);
            alert('Error al generar el reporte ejecutivo: ' + (error as Error).message);
        } finally {
            setGeneratingExecutiveReport(false);
        }
    };

    // Funciones auxiliares para el combobox con search
    const getMortgageFilesForCombo = () => {
        // Convertir mortgageStatements a formato DocumentFile para el combo
        return mortgageStatements.map((stmt, index) => {
            const fileId = stmt.id || `mortgage-${index}`;
            return {
                id: fileId,
                name: `Statement ${stmt.jsonData?.reporteEstadoCuentaHipotecario?.informacionEstadoCuenta?.statementDate || stmt.fileName || `#${index + 1}`}`,
                uploadDate: stmt.fechaCreacion ? new Date(stmt.fechaCreacion).toLocaleDateString() : new Date().toLocaleDateString(),
                size: '0 KB', // Tamaño no disponible en MortgageStatement
                type: 'mortgage-statement', // Tipo correcto para que handleViewFile funcione
                url: stmt.documentUrl || ''
            };
        });
    };

    const filteredMortgageFiles = (files: DocumentFile[]) => {
        return files.filter(file => {
            const fileName = file.name || '';
            const uploadDate = file.uploadDate || '';
            const searchTermLower = searchTerm.toLowerCase();
            
            return fileName.toLowerCase().includes(searchTermLower) ||
                   uploadDate.toLowerCase().includes(searchTermLower);
        });
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        if (!isDropdownOpen) {
            setSearchTerm('');
        }
    };

    const handleMortgageToggle = (fileId: string) => {
        handleMortgageSelection(fileId, !selectedMortgageIds.includes(fileId));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando documentos...</p>
                </div>
            </div>
        );
    }

    if (!casa) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Casa no encontrada</h2>
                    <Button onClick={() => navigate('/mi-patrimonio/casas')} className="mt-4">
                        Volver a Mis Casas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/mi-patrimonio/casas')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                            </Button>
                            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Documentos de Propiedad
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {casa.direccion}, {casa.ciudad}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Gestión de Documentos
                                </h2>
                                <p className="text-gray-600">
                                    Organiza todos los documentos importantes de tu propiedad
                                </p>
                            </div>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="bg-gray-100 rounded-full p-1 max-w-md mx-auto">
                            <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                                 style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            3 de 6 tipos de documentos completados
                        </p>
                    </div>
                </div>

                {/* Document Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {documentTypes.map((docType) => {
                        const IconComponent = docType.icon;
                        const isUploading = uploadingDoc === docType.id;
                        const isDraggedOver = draggedOver === docType.id;
                        
                        return (
                            <Card 
                                key={docType.id} 
                                className={`
                                    relative overflow-hidden transition-all duration-300 cursor-pointer
                                    ${isDraggedOver ? 'scale-105 shadow-2xl ring-4 ring-blue-400' : 'hover:shadow-xl'}
                                    ${docType.borderColor} border-2
                                `}
                                onDragOver={(e) => handleDragOver(e, docType.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, docType)}
                                onClick={() => !isUploading && openFileSelector(docType)}
                            >
                                {/* Header */}
                                <div className={`${docType.bgColor} p-4 sm:p-6`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                                                <IconComponent className={`w-6 h-6 ${docType.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                                    {docType.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {docType.files.length > 0 ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-xs">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {docType.files.length} archivo(s)
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Sin documentos
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Status icon y botón de refresh para hipoteca */}
                                        <div className="flex items-center gap-2">
                                            {docType.id === 'mortgage' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRefreshMortgages();
                                                    }}
                                                    disabled={refreshingMortgages}
                                                    className={`p-1 rounded-full transition-colors ${
                                                        refreshingMortgages 
                                                            ? 'bg-gray-100 cursor-not-allowed' 
                                                            : 'bg-amber-100 hover:bg-amber-200'
                                                    }`}
                                                    title="Refrescar estados de cuenta"
                                                >
                                                    <RefreshCw className={`w-4 h-4 text-amber-600 ${
                                                        refreshingMortgages ? 'animate-spin' : ''
                                                    }`} />
                                                </button>
                                            )}
                                            <div className={`p-1 rounded-full ${docType.files.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                {docType.files.length > 0 ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Plus className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        {docType.description}
                                    </p>

                                    {/* Upload area */}
                                    <div className={`
                                        border-2 border-dashed rounded-lg p-4 text-center transition-all
                                        ${isDraggedOver 
                                            ? 'border-blue-400 bg-blue-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                        }
                                    `}>
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                                <span className="text-sm text-gray-600">Subiendo...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Cloud className="w-8 h-8 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Arrastra archivos aquí
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        o haz click para seleccionar
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Files list */}
                                    {docType.files.length > 0 && (
                                        <div 
                                            className="mt-4 space-y-2"
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                        >
                                            <h4 className={`text-sm font-semibold ${
                                                docType.id === 'insurance' 
                                                    ? 'text-blue-700 bg-blue-50 px-2 py-1 rounded-md' 
                                                    : docType.id === 'mortgage'
                                                    ? 'text-amber-700 bg-amber-50 px-2 py-1 rounded-md'
                                                    : 'text-gray-900'
                                            }`}>
                                                {docType.id === 'mortgage' && docType.files.length > 1 ? 'Estados de cuenta:' : 'Archivos subidos:'}
                                            </h4>
                                            
                                            {/* Sistema dual de combos para hipotecas */}
                                            {docType.id === 'mortgage' && docType.files.length > 1 ? (
                                                <div 
                                                    className="space-y-3"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    {/* Modo Compacto - Combobox con Search */}
                                                    {mortgageViewMode === 'compact' ? (
                                                        <>
                                                            {/* Combobox con Search para Selección Múltiple */}
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md block">
                                                                    📊 Seleccionar Estados para Reporte Ejecutivo:
                                                                </label>
                                                                
                                                                {/* Combobox con Search */}
                                                                <div 
                                                                    className="relative"
                                                                    ref={dropdownRef}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                >
                                                                    {/* Input del combobox */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={toggleDropdown}
                                                                        className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <Search className="w-4 h-4 text-gray-400" />
                                                                                <span className="text-sm text-gray-700">
                                                                                    {selectedMortgageIds.length === 0 
                                                                                        ? 'Buscar y seleccionar estados...' 
                                                                                        : `${selectedMortgageIds.length} estado(s) seleccionado(s)`
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            {isDropdownOpen ? (
                                                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                                                            ) : (
                                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                    </button>

                                                                    {/* Dropdown con search y checkboxes */}
                                                                    {isDropdownOpen && (
                                                                        <div className="absolute z-10 mt-1 w-full bg-white border border-green-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                                                                            {/* Campo de búsqueda */}
                                                                            <div className="p-2 border-b border-gray-200">
                                                                                <div className="relative">
                                                                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Buscar por nombre o fecha..."
                                                                                        value={searchTerm}
                                                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                                                        className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Opción "Seleccionar todos" */}
                                                                            <div className="p-2 border-b border-gray-200 bg-gray-50">
                                                                                <label className="flex items-center gap-3 cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={selectedMortgageIds.length === getMortgageFilesForCombo().length}
                                                                                        onChange={(e) => handleSelectAllMortgages(e.target.checked)}
                                                                                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                                                    />
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        Seleccionar todos ({getMortgageFilesForCombo().length})
                                                                                    </span>
                                                                                </label>
                                                                            </div>

                                                                            {/* Lista de opciones filtradas */}
                                                                            <div className="max-h-48 overflow-y-auto">
                                                                                {filteredMortgageFiles(getMortgageFilesForCombo()).length === 0 ? (
                                                                                    <div className="p-3 text-center text-gray-500 text-sm">
                                                                                        {mortgageStatements.length === 0 ? 'No hay estados de cuenta disponibles' : 'No se encontraron estados de cuenta'}
                                                                                    </div>
                                                                                ) : (
                                                                                    filteredMortgageFiles(getMortgageFilesForCombo()).map((file) => (
                                                                                        <label 
                                                                                            key={file.id}
                                                                                            className="flex items-center gap-3 p-2 hover:bg-green-50 cursor-pointer group"
                                                                                        >
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedMortgageIds.includes(file.id)}
                                                                                                onChange={() => handleMortgageToggle(file.id)}
                                                                                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                                                            />
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                                                                    <div className="min-w-0 flex-1">
                                                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                                                            {file.name}
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-500 truncate">
                                                                                                            {file.uploadDate}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    e.stopPropagation();
                                                                                                    handleViewFile(file);
                                                                                                    setIsDropdownOpen(false);
                                                                                                }}
                                                                                                className="opacity-0 group-hover:opacity-100 p-1 text-amber-600 hover:bg-amber-100 rounded transition-all"
                                                                                                title="Ver reporte individual"
                                                                                            >
                                                                                                <Eye className="w-4 h-4" />
                                                                                            </button>
                                                                                        </label>
                                                                                    ))
                                                                                )}
                                                                            </div>

                                                                            {/* Footer del dropdown */}
                                                                            {selectedMortgageIds.length > 0 && (
                                                                                <div className="p-2 border-t border-gray-200 bg-gray-50">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-xs text-gray-600">
                                                                                            {selectedMortgageIds.length} seleccionado(s)
                                                                                        </span>
                                                                                        <button
                                                                                            onClick={() => setSelectedMortgageIds([])}
                                                                                            className="text-xs text-red-600 hover:text-red-800 underline"
                                                                                        >
                                                                                            Limpiar todo
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Botones de Acción */}
                                                            <div className="flex gap-2 pt-2 border-t border-gray-200">
                                                                <button
                                                                    onClick={handleGenerateExecutiveReport}
                                                                    disabled={selectedMortgageIds.length === 0 || generatingExecutiveReport}
                                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                        selectedMortgageIds.length > 0 && !generatingExecutiveReport
                                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                    }`}
                                                                >
                                                                    {generatingExecutiveReport ? (
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                                                            Generando...
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <FileText className="w-4 h-4" />
                                                                            Generar Reporte ({selectedMortgageIds.length})
                                                                        </div>
                                                                    )}
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={() => setMortgageViewMode('expanded')}
                                                                    className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                                                                    title="Cambiar a vista expandida"
                                                                >
                                                                    📋 Vista Expandida
                                                                </button>
                                                            </div>

                                                            {/* Tips mejorados */}
                                                            <div className="text-xs bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                                                                <div className="font-medium text-gray-700 mb-1">💡 Cómo usar:</div>
                                                                <ul className="space-y-1 text-gray-600">
                                                                    <li>• <strong>Buscar:</strong> Escribe en el campo para filtrar estados de cuenta</li>
                                                                    <li>• <strong>Ver individual:</strong> Usa el botón 👁️ en cada estado (aparece al pasar el mouse)</li>
                                                                    <li>• <strong>Reporte ejecutivo:</strong> Selecciona múltiples estados y haz clic en "Generar Reporte"</li>
                                                                    <li>• <strong>Análisis de tendencias:</strong> Ideal para comparar múltiples meses</li>
                                                                </ul>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        /* Modo Expandido - Vista Completa con Checkboxes */
                                                        <>
                                                            {/* Header del modo expandido */}
                                                            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="select-all-mortgages"
                                                                        checked={selectedMortgageIds.length === docType.files.length}
                                                                        onChange={(e) => handleSelectAllMortgages(e.target.checked)}
                                                                        className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                                                    />
                                                                    <label htmlFor="select-all-mortgages" className="text-sm text-gray-700 font-medium">
                                                                        Seleccionar todos ({docType.files.length})
                                                                    </label>
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={() => setMortgageViewMode('compact')}
                                                                    className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200 transition-colors"
                                                                    title="Cambiar a vista compacta"
                                                                >
                                                                    📝 Vista Compacta
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Lista expandida con checkboxes */}
                                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                                {docType.files.map((file) => (
                                                                    <div 
                                                                        key={file.id} 
                                                                        className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-200"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`mortgage-${file.id}`}
                                                                            checked={selectedMortgageIds.includes(file.id)}
                                                                            onChange={(e) => handleMortgageSelection(file.id, e.target.checked)}
                                                                            className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                                                        />
                                                                        
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                                        {file.name}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        {file.uploadDate}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleViewFile(file);
                                                                            }}
                                                                            className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                                                                            title="Ver reporte individual"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Botón de reporte ejecutivo para modo expandido */}
                                                            <button
                                                                onClick={handleGenerateExecutiveReport}
                                                                disabled={selectedMortgageIds.length === 0 || generatingExecutiveReport}
                                                                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                    selectedMortgageIds.length > 0 && !generatingExecutiveReport
                                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {generatingExecutiveReport ? (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                                                        Generando Reporte...
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <FileText className="w-4 h-4" />
                                                                        Generar Reporte Ejecutivo ({selectedMortgageIds.length})
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Vista normal para otros tipos */
                                                <>
                                                    {docType.files.slice(0, 2).map((file) => (
                                                        <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                                            <div className="flex items-center gap-2">
                                                                <FileImage className="w-4 h-4 text-gray-400" />
                                                                <span className="text-xs text-gray-700 truncate">
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button 
                                                                    className="p-1 hover:bg-gray-200 rounded"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        console.log('👁️ Botón ojo clickeado para archivo:', file);
                                                                        handleViewFile(file);
                                                                    }}
                                                                >
                                                                    <Eye className="w-3 h-3 text-gray-500" />
                                                                </button>
                                                                <button 
                                                                    className="p-1 hover:bg-gray-200 rounded"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Download className="w-3 h-3 text-gray-500" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {docType.files.length > 2 && (
                                                        <p className="text-xs text-gray-500 text-center">
                                                            +{docType.files.length - 2} archivo(s) más
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Tips section */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        Consejos para organizar tus documentos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">📄 Formatos recomendados:</h4>
                            <ul className="space-y-1 ml-4">
                                <li>• PDF para documentos oficiales</li>
                                <li>• JPG/PNG para fotos de alta calidad</li>
                                <li>• Documentos escaneados a 300 DPI mínimo</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">🔒 Seguridad:</h4>
                            <ul className="space-y-1 ml-4">
                                <li>• Tus documentos están encriptados</li>
                                <li>• Acceso solo con tu autenticación</li>
                                <li>• Respaldo automático en la nube</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de visualización de archivos */}
            {showViewModal && selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedFile.name}
                            </h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <span className="text-gray-500 text-xl">×</span>
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex-1 overflow-auto p-4">
                            {selectedFile.type === 'html' && selectedFile.id === 'home-insurance-analysis' ? (
                                <div 
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ 
                                        __html: casa?.aiAnalysis?.homeInsurance || 'Contenido no disponible' 
                                    }}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Vista previa no disponible para este tipo de archivo</p>
                                </div>
                            )}
                        </div>

                        {/* Footer del modal */}
                        <div className="border-t p-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowViewModal(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de visualización de statements de hipoteca */}
            {showMortgageModal && selectedMortgageStatement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Estado de Cuenta Hipotecario
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Fecha: {selectedMortgageStatement.jsonData?.reporteEstadoCuentaHipotecario?.informacionEstadoCuenta?.statementDate || 'N/A'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowMortgageModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <span className="text-gray-500 text-xl">×</span>
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex-1 overflow-auto p-4">
                            <div 
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: selectedMortgageStatement.htmlReport || 'Contenido no disponible' 
                                }}
                            />
                        </div>

                        {/* Footer del modal */}
                        <div className="border-t p-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowMortgageModal(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de reporte ejecutivo */}
            {showExecutiveReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                    Reporte Ejecutivo de Estados de Cuenta
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Análisis consolidado de {selectedMortgageIds.length} estado(s) de cuenta
                                </p>
                            </div>
                            <button
                                onClick={() => setShowExecutiveReportModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <span className="text-gray-500 text-xl">×</span>
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex-1 overflow-auto p-4">
                            <div 
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: executiveReportContent || 'Generando reporte...' 
                                }}
                            />
                        </div>

                        {/* Footer del modal */}
                        <div className="border-t p-4 flex justify-between">
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Reporte generado exitosamente
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Aquí se podría agregar funcionalidad de descarga
                                        alert('Funcionalidad de descarga próximamente');
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowExecutiveReportModal(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Progreso de Procesamiento */}
            {showProcessingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Header elegante */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Análisis Inteligente</h3>
                                    <p className="text-blue-100 text-sm">Procesamiento avanzado con IA</p>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            {/* Archivos a procesar */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileCheck className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Procesando archivo {currentFileIndex + 1} de {processingFiles.length}
                                    </span>
                                </div>
                                {processingFiles.length > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-800 font-medium truncate">
                                            {processingFiles[currentFileIndex]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progreso</span>
                                    <span className="text-sm text-gray-600">{Math.round(processingProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                                        style={{ width: `${processingProgress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Paso actual */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex-shrink-0">
                                        <div className="animate-spin">
                                            <Zap className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">{processingStep}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Beneficios del análisis */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    Análisis que recibirás:
                                </h4>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-blue-500" />
                                        <span>Extracción inteligente de datos financieros</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-3 h-3 text-purple-500" />
                                        <span>Análisis de tendencias de pagos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        <span>Recomendaciones financieras personalizadas</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileCheck className="w-3 h-3 text-indigo-500" />
                                        <span>Reportes ejecutivos profesionales</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer informativo */}
                        <div className="bg-gray-50 px-6 py-4 border-t">
                            <p className="text-xs text-gray-500 text-center">
                                ⚡ Tecnología de vanguardia para maximizar tu patrimonio inmobiliario
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentosCasaPage;