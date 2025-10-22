interface DocumentListResponseWithStatus extends DocumentListResponse {
    success: boolean;
}

// Interfaces para el endpoint de metadata de facturas
interface InvoiceMetadata {
    id: string;
    twinID: string;
    fileName: string;
    filePath: string;
    invoiceTotal?: number;
    currency?: string;
    invoiceDate?: string;
    dueDate?: string;
    vendorName?: string;
    customerName?: string;
    lineItemsCount?: number;
    totalTax?: number;
    subTotal?: number;
    processedAt: string;
    source?: string;
    success?: boolean;
    invoiceNumber?: string;
    totalPages?: number;
    tablesCount?: number;
    rawFieldsCount?: number;
    vendorNameConfidence?: number;
    customerNameConfidence?: number;
    invoiceTotalConfidence?: number;
    subTotalConfidence?: number;
    createdAt?: string;
    errorMessage?: string;
}

interface InvoicesMetadataResponse {
    success: boolean;
    twinId: string;
    totalInvoices: number;
    invoices: InvoiceMetadata[];
    summary: {
        totalAmount: number;
        averageAmount: number;
        totalTax: number;
        totalLineItems: number;
        dateRange: string;
        topVendors: any[];
    };
    processingTimeSeconds: number;
    retrievedAt: string;
    message: string;
    note: string;
}

// Interface para la respuesta del endpoint GetInvoiceById
interface GetInvoiceByIdResponse {
    Success: boolean;
    TwinId: string;
    DocumentId: string;
    Invoice: {
        id?: string;
        fileName: string;
        filePath: string;
        vendorName: string;
        vendorAddress?: string;
        invoiceDate: string;
        dueDate?: string;
        invoiceNumber: string;
        invoiceTotal: number;
        totalAmount?: number;
        currency: string;
        totalTax: number;
        taxAmount?: number;
        subTotal: number;
        lineItems?: any[];
        extractedText?: string;
        htmlContent?: string;
        aiSummary?: string;
        documentUrl?: string;
        fileUrl?: string;
        // Otros campos que pueda contener la respuesta completa
        [key: string]: any;
    };
    ProcessingTimeSeconds: number;
    RetrievedAt: string;
    Message: string;
    Note: string;
}

interface CSVRecord {
    data: { [key: string]: string };
    Data?: { [key: string]: string }; // Backup para compatibilidad
}

interface CSVFileMetadata {
    Id: string;
    TwinId: string;
    FileName: string;
    ContainerName: string;
    FilePath: string;
    TotalRows: number;
    TotalColumns: number;
    ColumnNames: string[];
    ProcessedAt: string;
    Success: boolean;
    ErrorMessage?: string;
    DocumentType: string;
    CreatedAt: string;
}

interface CSVFileData extends CSVFileMetadata {
    Records: CSVRecord[];
    // Campos adicionales para compatibilidad camelCase
    id?: string;
    twinId?: string;
    fileName?: string;
    containerName?: string;
    filePath?: string;
    totalRows?: number;
    totalColumns?: number;
    columnNames?: string[];
    records?: CSVRecord[];
    processedAt?: string;
    success?: boolean;
    errorMessage?: string;
}

interface CSVFilesResponse {
    Success: boolean;
    TwinId: string;
    TotalFiles: number;
    Files: CSVFileData[];
    RetrievedAt: string;
    Message: string;
}

interface DocumentUploadResponse {
    success?: boolean; // Campo para indicar éxito del operación
    message?: string;
    file_url?: string;
    file_path?: string;
    name?: string;
    size?: number;
    document_type?: string;
    documentId?: string; // Para orchestrator responses
    id?: string; // Para Azure Functions orchestrator response format
    file_name?: string; // Para el nuevo endpoint upload-document
    file_size?: number; // Para el nuevo endpoint upload-document
    twin_id?: string; // Para el nuevo endpoint upload-document
    upload_result?: string; // Para el nuevo endpoint upload-document
    processing_time?: number; // Tiempo de procesamiento en segundos
    metadata?: any; // Metadatos del archivo
    estructura?: string; // Estructura del documento
    total_paginas?: number; // Total de páginas
    tiene_indice?: string; // Si tiene índice ("Sí" o "No")
}

interface DocumentInfo {
    id?: string; // ID del documento
    filename: string;
    file_path: string;
    public_url: string;
    last_modified?: string;
    size_bytes: number;
    document_type?: string; // Tipo de documento
    structure_type?: string; // Tipo de estructura
    sub_category?: string; // Subcategoría
    content_summary?: string; // Resumen del contenido
    language?: string; // Idioma
    pages?: number; // Número de páginas
    
    // Metadatos del documento EXTENDIDOS con datos ricos
    metadata?: {
        // Campos básicos
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
        
        // DATOS RICOS del análisis del backend
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
        
        // NUEVOS CAMPOS desde CosmosDocumentSummary - Document Intelligence
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
        
        // NUEVOS CAMPOS - AI flags
        hasAiExecutiveSummary?: boolean;
        hasAiInvoiceAnalysis?: boolean;
        hasAiCompleteAnalysis?: boolean;
        aiDataFieldsCount?: number;
        
        // NUEVOS CAMPOS - Otros
        source?: string;
        errorMessage?: string;
        sasUrl?: string; // SAS URL para acceso directo al archivo
        AiExecutiveSummaryHtml?: string; // Campo específico para resumen IA en HTML
    };
    // Campo para toda la data del documento (usado para filtrado local)
    allDocumentData?: any;
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

interface DocumentListResponse {
    documents: DocumentInfo[];
}

interface DocumentAIAnalysisResponse {
    success?: boolean; // Campo para indicar éxito del operación
    message?: string;
    analysisResults?: any;
    documentId?: string;
    status?: string;
    id?: string; // Para Azure Functions orchestrator
    statusQueryGetUri?: string; // Para Azure Functions orchestrator
    sendEventPostUri?: string; // Para Azure Functions orchestrator
    terminatePostUri?: string; // Para Azure Functions orchestrator
    purgeHistoryDeleteUri?: string; // Para Azure Functions orchestrator
}

class DocumentAPIService {
    private baseURL: string;

    constructor() {
        // En desarrollo, usar proxy de Vite (rutas relativas /api)
        // En producción, usar la URL completa
        this.baseURL = import.meta.env.DEV 
            ? '' // Usar rutas relativas para que Vite proxy las redirija
            : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:7011');
            
        console.log('🔗 Conectando directamente a Azure Functions:', this.baseURL || '/api');
    }

    /**
     * Get basic headers for requests (no API key required for local development)
     */
    private getAuthHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Convert File to base64 string
     */
    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data:mime/type;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Map subcategory to document type for API
     */
    private getDocumentTypeFromSubcategory(subCategory: string): string {
        const mapping: { [key: string]: string } = {
            // Semi-structured documents (both English IDs and Spanish labels)
            'invoice': 'Invoice',
            'factura': 'Invoice',
            'Facturas': 'Invoice',
            'license': 'License',
            'Licencias': 'License',
            'birth_certificate': 'Birth Certificate',
            'Certificados de nacimiento': 'Birth Certificate',
            'account_statement': 'Account Statement',
            'Estados de cuenta': 'Account Statement',
            'form': 'Form',
            'Formularios': 'Form',
            // Structured documents
            'csv': 'CSV',
            'CSV': 'CSV',
            'json': 'JSON',
            'JSON': 'JSON',
            'xml': 'XML',
            'XML': 'XML',
            'database': 'Database',
            'Base de datos': 'Database',
            // Unstructured documents
            'contract': 'Contract',
            'Contratos': 'Contract',
            'report': 'Report',
            'Reportes': 'Report',
            'email': 'Email',
            'Emails': 'Email',
            'letter': 'Letter',
            'Cartas': 'Letter',
            'article': 'Article',
            'Artículos': 'Article',
            // Official documents
            'passport': 'Passport',
            'id': 'ID Document',
            'visa': 'Visa',
            'diploma': 'Diploma',
            'marriage_certificate': 'Marriage Certificate'
        };

        return mapping[subCategory] || 'Document';
    }

    /**
     * List documents for a specific twin (all documents in the twin's container)
     */
    async listDocuments(twinId: string): Promise<DocumentListResponse> {
        try {
            console.log(`📂 Listando documentos para twin: ${twinId}`);
            
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.baseURL}/api/list-documents/${twinId}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ ${result.files?.length || result.documents?.length || 0} documentos encontrados`);
            return result;
        } catch (error) {
            console.error('❌ Error listing documents:', error);
            throw error;
        }
    }

    /**
     * List official documents for a specific twin (alias for listDocuments)
     */
    async listOfficialDocuments(twinId: string): Promise<DocumentListResponseWithStatus> {
        try {
            const result = await this.listDocuments(twinId);
            return {
                ...result,
                success: true
            };
        } catch (error) {
            console.error('❌ Error listing official documents:', error);
            return {
                documents: [],
                success: false
            };
        }
    }

    /**
     * List structured documents for a specific twin with optional filters
     */
    async listStructuredDocuments(
        twinId: string, 
        structureType?: string, 
        subCategory?: string
    ): Promise<DocumentListResponseWithStatus> {
        try {
            console.log(`📊 Listando documentos estructurados para twin: ${twinId}`);
            if (structureType) console.log(`🔍 Estructura: ${structureType}`);
            if (subCategory) console.log(`🔍 Subcategoría: ${subCategory}`);
            
            const headers = this.getAuthHeaders();
            let url = `${this.baseURL}/api/list-documents/${twinId}`;
            
            // Add query parameters if provided
            const params = new URLSearchParams();
            if (structureType) params.append('structure_type', structureType);
            if (subCategory) params.append('sub_category', subCategory);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ ${result.files?.length || result.documents?.length || 0} documentos estructurados encontrados`);
            return {
                ...result,
                success: true
            };
        } catch (error) {
            console.error('❌ Error listing structured documents:', error);
            return {
                documents: [],
                success: false
            };
        }
    }

    /**
     * Get CSV files metadata for fast listing (no CSV records)
     * Uses GET /api/get-csv-files-metadata/{twinId}
     */
    async getCSVFilesMetadata(twinId: string): Promise<CSVFileMetadata[]> {
        try {
            console.log(`📊 Obteniendo metadata de archivos CSV para twin: ${twinId}`);
            
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.baseURL}/api/get-csv-files-metadata/${encodeURIComponent(twinId)}`, {
                method: 'GET',
                headers
            });

            console.log(`📊 CSV Metadata response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ CSV Metadata error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Metadata de archivos CSV obtenida:', result);
            
            if (result?.success && result?.files) {
                // Mapear los datos de camelCase a PascalCase para consistencia
                return result.files.map((file: any) => ({
                    Id: file.id,
                    TwinId: file.twinId,
                    FileName: file.fileName,
                    ContainerName: file.containerName,
                    FilePath: file.filePath,
                    TotalRows: file.totalRows,
                    TotalColumns: file.totalColumns,
                    ColumnNames: file.columnNames,
                    ProcessedAt: file.processedAt,
                    Success: file.success,
                    ErrorMessage: file.errorMessage,
                    DocumentType: file.documentType,
                    CreatedAt: file.createdAt
                })) as CSVFileMetadata[];
            }
            
            return [];
        } catch (error) {
            console.error('❌ Error getting CSV metadata:', error);
            throw error;
        }
    }

    /**
     * Get specific CSV file with full data including records
     * Uses GET /api/get-csv-files/{twinId} and filters by ID
     */
    async getCSVFileById(twinId: string, csvId: string): Promise<CSVFileData | null> {
        try {
            console.log(`📊 Obteniendo archivo CSV específico: ${csvId} para twin: ${twinId}`);
            
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.baseURL}/api/get-csv-file/${encodeURIComponent(twinId)}/${encodeURIComponent(csvId)}`, {
                method: 'GET',
                headers
            });

            console.log(`📊 CSV File by ID response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ CSV File by ID error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Archivo CSV específico obtenido:', result);
            
            if (result?.success && result?.file) {
                const file = result.file;
                return {
                    Id: file.id,
                    TwinId: file.twinId,
                    FileName: file.fileName,
                    ContainerName: file.containerName,
                    FilePath: file.filePath,
                    TotalRows: file.totalRows,
                    TotalColumns: file.totalColumns,
                    ColumnNames: file.columnNames || [],
                    ProcessedAt: file.processedAt,
                    Success: file.success,
                    ErrorMessage: file.errorMessage,
                    DocumentType: file.documentType || 'CSV',
                    CreatedAt: file.createdAt || file.processedAt, // Usar processedAt como fallback
                    Records: (file.records || []).map((record: any) => ({
                        data: record.data || {},
                        Data: record.data // Mantener compatibilidad con el formato original
                    }))
                };
            }
            
            console.log(`❌ No se encontró el archivo CSV con ID: ${csvId}`);
            return null;
        } catch (error) {
            console.error('❌ Error getting CSV file by ID:', error);
            throw error;
        }
    }

    /**
     * Analyze CSV file using Azure AI Agent
     * Uses POST /api/analyze-csv-file/{twinId}/{fileName} or optimized version with FileID
     */
    async analyzeCSVFile(twinId: string, fileName: string, question: string, fileId?: string): Promise<any> {
        try {
            console.log(`🤖 Analizando archivo CSV: ${fileName} para twin: ${twinId}`);
            console.log(`❓ Pregunta: ${question}`);
            
            const headers = this.getAuthHeaders();
            
            // El FileID ahora va en la URL
            const fileIdParam = fileId || "empty";
            
            // Log para debugging
            if (fileId) {
                console.log(`🚀 Usando FileID para optimización: ${fileId}`);
            } else {
                console.log(`� Primera consulta - FileID vacío, se cargará el archivo completo`);
            }
            
            const response = await fetch(`${this.baseURL}/api/analyze-csv-file/${encodeURIComponent(twinId)}/${encodeURIComponent(fileName)}/${encodeURIComponent(fileIdParam)}`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Question: question
                })
            });

            console.log(`🤖 CSV Analysis response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ CSV Analysis error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Análisis CSV completado:', result);
            
            return result;
        } catch (error) {
            console.error('❌ Error analyzing CSV file:', error);
            throw error;
        }
    }

    /**
     * Get CSV files processed for a specific twin using the specific CSV endpoint
     * Uses GET /api/get-csv-files/{twinId}
     * @deprecated Use getCSVFilesMetadata for listing and getCSVFileById for details
     */
    async getCSVFiles(twinId: string): Promise<CSVFilesResponse> {
        try {
            console.log(`📊 Obteniendo archivos CSV procesados para twin: ${twinId}`);
            
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.baseURL}/api/get-csv-files/${encodeURIComponent(twinId)}`, {
                method: 'GET',
                headers
            });

            console.log(`📊 CSV Files response status: ${response.status}`);
            console.log(`📊 CSV Files response ok: ${response.ok}`);

            if (!response.ok) {
                let errorData: any;
                try {
                    const contentType = response.headers.get('content-type');
                    console.log(`📊 CSV Files Error response content-type: ${contentType}`);
                    
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                    } else {
                        const errorText = await response.text();
                        errorData = { error: errorText };
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing CSV files error response:', parseError);
                    errorData = { error: `HTTP ${response.status}: Error parsing response` };
                }
                
                console.error('❌ CSV Files error data:', errorData);
                const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // Procesar respuesta exitosa
            let result: any;
            try {
                const contentType = response.headers.get('content-type');
                console.log(`📊 CSV Files Success response content-type: ${contentType}`);
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                    console.log('✅ CSV Files JSON response parsed successfully:', result);
                } else {
                    const textResult = await response.text();
                    console.log('✅ CSV Files Text response received:', textResult);
                    // Intentar parsear como JSON
                    try {
                        result = JSON.parse(textResult);
                        console.log('✅ CSV Files Text successfully parsed as JSON:', result);
                    } catch {
                        result = {
                            Success: false,
                            message: textResult || 'Error obteniendo archivos CSV',
                            Files: []
                        };
                    }
                }
            } catch (parseError) {
                console.error('❌ Error parsing CSV files success response:', parseError);
                result = {
                    Success: false,
                    message: 'Error procesando respuesta de archivos CSV',
                    Files: []
                };
            }

            console.log('✅ Archivos CSV obtenidos exitosamente');
            console.log('📋 CSV Files Final processed result:', result);
            return result;
        } catch (error) {
            console.error('❌ Error getting CSV files:', error);
            throw error;
        }
    }

    /**
     * List documents by specific directory path
     * New format: GET /api/list-documents/{twinId}/{encodedDirectoryPath}
     * Example: GET /api/list-documents/TWN001/documents%252Finvoices → documents/Facturas
     */
    async listDocumentsByDirectory(
        twinId: string,
        directoryPath: string
    ): Promise<DocumentListResponseWithStatus> {
        try {
            console.log(`📂 Listando documentos por directorio para twin: ${twinId}`);
            console.log(`📁 Directorio: ${directoryPath}`);
            
            // Double encode the directory path for the URL
            // First encoding: / becomes %2F
            // Second encoding: %2F becomes %252F
            const encodedPath = encodeURIComponent(encodeURIComponent(directoryPath));
            console.log(`🔗 Path encoded: ${directoryPath} → ${encodedPath}`);
            
            const headers = this.getAuthHeaders();
            const url = `${this.baseURL}/api/list-documents/${twinId}/${encodedPath}`;
            
            console.log(`🌐 URL completa: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ ${result.files?.length || result.documents?.length || 0} documentos encontrados en directorio ${directoryPath}`);
            return {
                ...result,
                success: true
            };
        } catch (error) {
            console.error('❌ Error listing documents by directory:', error);
            return {
                documents: [],
                success: false
            };
        }
    }

    /**
     * Get directory path based on structure and subcategory filters
     */
    private getDirectoryPath(estructuraFiltro: string, subcategoriaFiltro: string): string | null {
        // If no specific filters are selected, return null to use general endpoint
        if (estructuraFiltro === "todas" && subcategoriaFiltro === "todas") {
            return null;
        }

        // Map structure types to directory names
        const structureMapping: { [key: string]: string } = {
            'estructurado': 'estructurado',
            'semi-estructurado': 'semi-estructurado', 
            'no-estructurado': 'no-estructurado'
        };

        // Map subcategories to directory names (supporting both IDs and Spanish labels)
        const subcategoryMapping: { [key: string]: string } = {
            // Semi-structured documents (IDs)
            'invoice': 'Facturas',
            'license': 'Licencias',
            'birth_certificate': 'Certificados-Nacimiento',
            'account_statement': 'Estados-Cuenta',
            'form': 'Formularios',
            // Semi-structured documents (Spanish labels)
            'Facturas': 'Facturas',
            'Licencias': 'Licencias',
            'Certificados de Nacimiento': 'Certificados-Nacimiento',
            'Estados de Cuenta': 'Estados-Cuenta',
            'Formularios': 'Formularios',
            // Structured documents (IDs)
            'csv': 'CSV',
            'json': 'JSON',
            'xml': 'XML',
            'database': 'Base-Datos',
            // Structured documents (Spanish labels)
            'CSV': 'CSV',
            'JSON': 'JSON',
            'XML': 'XML',
            'Base de Datos': 'Base-Datos',
            // Unstructured documents (IDs)
            'contract': 'Contratos',
            'report': 'Reportes',
            'email': 'Emails',
            'letter': 'Cartas',
            // Unstructured documents (Spanish labels)
            'Contratos': 'Contratos',
            'Reportes': 'Reportes',
            'Emails': 'Emails',
            'Cartas': 'Cartas',
            'Artículos': 'Articulos'
        };

        let directoryPath = '';

        // Build directory path based on filters
        if (estructuraFiltro !== "todas") {
            directoryPath = structureMapping[estructuraFiltro] || estructuraFiltro;
            
            if (subcategoriaFiltro !== "todas") {
                const subcategoryDir = subcategoryMapping[subcategoriaFiltro] || subcategoriaFiltro;
                directoryPath += `/${subcategoryDir}`;
            }
        } else if (subcategoriaFiltro !== "todas") {
            // If only subcategory is specified, we need to determine the structure
            const subcategoryDir = subcategoryMapping[subcategoriaFiltro] || subcategoriaFiltro;
            
            // Determine structure based on subcategory (support both IDs and Spanish labels)
            if (['invoice', 'license', 'birth_certificate', 'account_statement', 'form', 
                 'Facturas', 'Licencias', 'Certificados de Nacimiento', 'Estados de Cuenta', 'Formularios'].includes(subcategoriaFiltro)) {
                directoryPath = `semi-estructurado/${subcategoryDir}`;
            } else if (['csv', 'json', 'xml', 'database',
                       'CSV', 'JSON', 'XML', 'Base de Datos'].includes(subcategoriaFiltro)) {
                directoryPath = `estructurado/${subcategoryDir}`;
            } else if (['contract', 'report', 'email', 'letter', 'article',
                       'Contratos', 'Reportes', 'Emails', 'Cartas', 'Artículos'].includes(subcategoriaFiltro)) {
                directoryPath = `no-estructurado/${subcategoryDir}`;
            } else {
                directoryPath = subcategoryDir;
            }
        }

        console.log(`📁 Directory path construido: "${directoryPath}" para estructura="${estructuraFiltro}" y subcategoria="${subcategoriaFiltro}"`);
        return directoryPath || null;
    }

    /**
     * Upload structured document
     */
    async uploadStructuredDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'estructurado'
    ): Promise<DocumentUploadResponse> {
        return this.uploadDocument(twinId, file, subCategory, estructuraFiltro);
    }

    /**
     * Upload official document (alias for uploadDocument)
     */
    async uploadOfficialDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'no-estructurado'
    ): Promise<DocumentUploadResponse> {
        return this.uploadDocument(twinId, file, subCategory, estructuraFiltro);
    }

    /**
     * Upload no-structured document with additional metadata
     */
    async uploadNoStructuredDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructura: string = 'no-estructurado',
        totalPaginas: number,
        tieneIndice: boolean,
        paginaInicioIndice: number = 1,
        paginaFinIndice: number = 1,
        requiereTraduccion: boolean = false,
        idiomaDestino: string = 'es',
        modelo: string = 'gpt-5-mini'
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento no estructurado para twin: ${twinId}`);
            console.log(`📋 Subcategoría: ${subCategory}, Páginas: ${totalPaginas}, Tiene índice: ${tieneIndice}`);

            // Convertir archivo a base64
            const base64Content = await this.fileToBase64(file);
            
            // Prepare JSON payload
            const requestData = {
                FileName: file.name,
                FileContent: base64Content,
                ContainerName: `twin-${twinId}`,
                FilePath: `${estructura}/${subCategory}`,
                Estructura: estructura,
                Subcategoria: subCategory,
                TotalPaginas: totalPaginas,
                TieneIndice: tieneIndice,
                StartIndex: tieneIndice ? paginaInicioIndice : 0,
                EndIndex: tieneIndice ? paginaFinIndice : 0,
                RequiereTraduccion: requiereTraduccion,
                IdiomaDestino: idiomaDestino,
                Model: modelo
            };

            console.log(`🌐 Llamando al endpoint: ${this.baseURL}/api/upload-no-structured-document/${twinId}`);
            console.log(`📋 Datos enviados:`, {
                FileName: requestData.FileName,
                ContainerName: requestData.ContainerName,
                FilePath: requestData.FilePath,
                Estructura: requestData.Estructura,
                Subcategoria: requestData.Subcategoria,
                TotalPaginas: requestData.TotalPaginas,
                TieneIndice: requestData.TieneIndice,
                StartIndex: requestData.StartIndex,
                EndIndex: requestData.EndIndex,
                RequiereTraduccion: requestData.RequiereTraduccion,
                IdiomaDestino: requestData.IdiomaDestino,
                Model: requestData.Model,
                FileContentLength: base64Content.length
            });

            const response = await fetch(`${this.baseURL}/api/upload-no-structured-document/${twinId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error HTTP ${response.status}:`, errorText);
                throw new Error(`Error HTTP ${response.status}: ${errorText}`);
            }

            const responseData = await response.json();
            console.log(`✅ Respuesta exitosa del backend:`, responseData);

            return {
                success: responseData.Success || true,
                message: responseData.Message || 'Documento subido exitosamente',
                file_url: responseData.Url,
                file_path: responseData.FilePath,
                name: responseData.FileName || file.name,
                size: responseData.FileSize || file.size,
                document_type: responseData.Subcategoria || subCategory,
                processing_time: responseData.ProcessingTimeSeconds,
                metadata: responseData.Metadata,
                estructura: responseData.Estructura,
                total_paginas: responseData.TotalPaginas,
                tiene_indice: responseData.TieneIndice
            };

        } catch (error) {
            console.error('❌ Error al subir documento no estructurado:', error);
            throw error;
        }
    }

    /**
     * Delete official document using the new API format
     */
    async deleteOfficialDocument(twinId: string, documentId: string): Promise<{ message: string; success: boolean }> {
        try {
            const result = await this.deleteDocument(twinId, documentId);
            return {
                ...result,
                success: true
            };
        } catch (error) {
            return {
                message: error instanceof Error ? error.message : 'Error desconocido',
                success: false
            };
        }
    }

    /**
     * Check orchestrator status using the statusQueryGetUri provided by the orchestrator
     */
    async checkOrchestratorStatus(statusUri: string): Promise<any> {
        try {
            console.log(`🔍 Checking orchestrator status using URI: ${statusUri}`);
            
            // If statusUri is just a documentId, construct the proper URI
            let fullUri = statusUri;
            if (!statusUri.startsWith('http')) {
                // Fallback to constructed URI if only documentId provided
                fullUri = `${this.baseURL}/runtime/webhooks/durabletask/instances/${statusUri}`;
                console.log(`🔧 Constructed status URI: ${fullUri}`);
            }
            
            const headers = this.getAuthHeaders();
            const response = await fetch(fullUri, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Orchestrator status retrieved:', result?.runtimeStatus || 'Status unknown');
            return result;
        } catch (error) {
            console.error('❌ Error checking orchestrator status:', error);
            throw error;
        }
    }

    /**
     * Delete a specific document for a twin using the new API format
     */
    async deleteDocument(twinId: string, documentId: string): Promise<{ message: string }> {
        try {
            console.log(`🗑️ Eliminando documento: ${documentId} para twin: ${twinId}`);
            
            const headers = this.getAuthHeaders();
            // Remove Content-Type for the DELETE request with URL params
            delete headers['Content-Type'];

            const response = await fetch(`${this.baseURL}/api/delete-document/${encodeURIComponent(twinId)}/${encodeURIComponent(documentId)}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Documento eliminado exitosamente');
            return result;
        } catch (error) {
            console.error('❌ Error deleting document:', error);
            throw error;
        }
    }

    /**
     * Upload document to Data Lake using the new upload endpoint with base64 format
     * New format: POST /api/upload-document/{twinId} with JSON body including documentType
     */
    async uploadDocumentToDataLake(
        file: File,
        twinId: string,
        filePath: string,
        fileName: string,
        documentType?: string
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento al Data Lake con nuevo formato...`);
            console.log(`📋 Twin ID: ${twinId}`);
            console.log(`📁 File Path: ${filePath}`);
            console.log(`📄 File Name: ${fileName}`);
            console.log(`📋 Document Type: ${documentType || 'No especificado'}`);
            console.log(`💾 File Size: ${file.size} bytes`);

            // Convert file to base64
            const fileContent = await this.fileToBase64(file);
            console.log(`🔄 Archivo convertido a base64, tamaño: ${fileContent.length} caracteres`);

            // Create JSON body in the new format
            const requestBody: any = {
                fileName: fileName,
                fileContent: fileContent,
                filePath: filePath
            };

            // Add documentType if provided
            if (documentType) {
                requestBody.documentType = documentType;
            }

            console.log('📋 Request body structure:', {
                fileName: requestBody.fileName,
                fileContentLength: requestBody.fileContent.length,
                filePath: requestBody.filePath,
                documentType: requestBody.documentType || 'No especificado'
            });

            const headers = this.getAuthHeaders();
            console.log('🔑 Headers for upload:', headers);

            const response = await fetch(`${this.baseURL}/api/upload-document/${encodeURIComponent(twinId)}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            console.log(`📊 Upload response status: ${response.status}`);
            console.log(`📊 Upload response headers:`, Object.fromEntries(response.headers.entries()));
            console.log(`📊 Upload response ok: ${response.ok}`);
            console.log(`📊 Upload response statusText: ${response.statusText}`);

            if (!response.ok) {
                let errorData: any;
                try {
                    const contentType = response.headers.get('content-type');
                    console.log(`📊 Error response content-type: ${contentType}`);
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                        console.error('❌ JSON error response:', errorData);
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Text error response:', errorText);
                        errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing error response:', parseError);
                    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                }
                
                console.error('❌ Upload error response:', errorData);
                
                // Mensaje de error más específico
                const errorMessage = errorData.error || errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // Intentar procesar la respuesta exitosa
            let result: any;
            try {
                const contentType = response.headers.get('content-type');
                console.log(`📊 Success response content-type: ${contentType}`);
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                    console.log('✅ JSON response parsed successfully:', result);
                } else {
                    const textResult = await response.text();
                    console.log('✅ Text response received:', textResult);
                    // Intentar parsear como JSON si es posible
                    try {
                        result = JSON.parse(textResult);
                        console.log('✅ Text successfully parsed as JSON:', result);
                    } catch {
                        // Si no es JSON válido, crear un objeto de respuesta
                        result = { success: true, message: textResult };
                        console.log('✅ Text response wrapped in object:', result);
                    }
                }
            } catch (parseError) {
                console.error('❌ Error parsing success response:', parseError);
                // Si no podemos parsear la respuesta, asumir éxito básico
                result = { success: true, message: 'Upload completed but response parsing failed' };
            }
            
            console.log('✅ Documento subido exitosamente al Data Lake con nuevo formato');
            console.log('📋 Final processed result:', result);
            
            return result;
        } catch (error) {
            console.error('❌ Error subiendo documento al Data Lake:', error);
            throw error;
        }
    }

    /**
     * Start PDF processing using orchestrator for semi-structured documents
     * This is a two-step process:
     * 1. Upload file to Data Lake using the new upload endpoint
     * 2. Start orchestrator with the file information
     */
    async startPDFProcessingOrchestrator(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'semi-estructurado'
    ): Promise<DocumentAIAnalysisResponse> {
        try {
            console.log(`🚀 Iniciando proceso de orchestrator para twin: ${twinId}`);
            console.log(`📋 Categoría: ${subCategory}, Estructura: ${estructuraFiltro}`);

            // El container name es el twinId INTACTO (con guiones)
            const containerName = twinId;
            console.log(`📦 Container name: ${containerName}`);

            // Usar el nombre del archivo TAL COMO ES (sin modificaciones)
            const fileName = file.name;
            
            // Construct file path based on structure and subcategory selected by user
            // Use exactly what the user selected in the filters, no automatic mapping
            let filePath: string;
            if (subCategory && subCategory !== 'todas' && estructuraFiltro !== 'todas') {
                // Use the exact structure and subcategory from user selection
                filePath = `${estructuraFiltro}/${subCategory}`;
                console.log(`📁 Usando ruta exacta de filtros del usuario: ${estructuraFiltro}/${subCategory}`);
            } else if (estructuraFiltro !== 'todas') {
                // Only structure is specified
                filePath = estructuraFiltro;
                console.log(`📁 Usando solo estructura: ${estructuraFiltro}`);
            } else {
                // Fallback to semi-structured if nothing specified
                filePath = 'semi-estructurado';
                console.log(`📁 Fallback a semi-estructurado`);
            }

            console.log(`📁 File path construido para orchestrator: ${filePath}`);
            console.log(`📄 File name (original): ${fileName}`);

            // PASO 1: Subir el archivo al Data Lake
            console.log(`📤 PASO 1: Subiendo archivo al Data Lake...`);
            
            // Get document type from subcategory for the orchestrator
            const documentType = this.getDocumentTypeFromSubcategory(subCategory);
            console.log(`📋 Document type para orchestrator: ${documentType}`);
            
            let uploadResult: DocumentUploadResponse;
            try {
                uploadResult = await this.uploadDocumentToDataLake(
                    file,
                    containerName, // Usar containerName en lugar de twinId
                    filePath,
                    fileName,
                    documentType // Pasar el document type
                );
                console.log(`✅ PASO 1 COMPLETADO: Archivo subido exitosamente`);
            } catch (uploadError) {
                console.error(`❌ PASO 1 FALLÓ: Error subiendo archivo:`, uploadError);
                throw new Error(`No se pudo subir el archivo: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`);
            }

            // PASO 2: Iniciar el orchestrator con la información del archivo subido
            console.log(`🤖 PASO 2: Iniciando orchestrator...`);

            // JSON body en el formato exacto que espera el backend del orchestrator
            const requestBody = {
                twin_id: containerName, // El twinId INTACTO (con guiones)
                container_name: containerName, // El contenedor es el twinId INTACTO (con guiones)
                file_path: uploadResult.file_path || filePath, // Path sin twinId
                file_name: uploadResult.file_name || uploadResult.name || fileName
            };

            console.log(`📋 Request body para orchestrator:`, requestBody);
            console.log(`📤 JSON enviado:`, JSON.stringify(requestBody, null, 2));

            // Validar JSON antes de enviar
            try {
                const jsonString = JSON.stringify(requestBody);
                JSON.parse(jsonString); // Verificar que es JSON válido
            } catch (jsonError) {
                console.error('❌ Error: JSON inválido:', jsonError);
                throw new Error('Datos inválidos para el orchestrator');
            }

            const headers = this.getAuthHeaders();
            console.log('🔑 Headers para orchestrator:', headers);

            const response = await fetch(`${this.baseURL}/api/orchestrators/process_pdf_orchestrator`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            console.log(`📊 Orchestrator response status: ${response.status}`);
            console.log(`📊 Orchestrator response headers:`, Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorData: any;
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                        console.error('❌ Orchestrator JSON error response:', errorData);
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Orchestrator text error response:', errorText);
                        errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing orchestrator error response:', parseError);
                    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                }
                
                console.error('❌ Orchestrator error response:', errorData);
                
                // Mensaje de error más específico
                const errorMessage = errorData.error || errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(`Error en orchestrator: ${errorMessage}`);
            }

            const result = await response.json();
            console.log('✅ PASO 2 COMPLETADO: Orchestrator iniciado exitosamente');
            console.log('📋 Orchestrator response:', result);

            // Agregar success flag para compatibilidad
            return {
                ...result,
                success: true
            };
        } catch (error) {
            console.error('❌ Error en proceso completo de PDF:', error);
            throw error;
        }
    }

    /**
     * Upload PDF document with AI analysis using the new base64 format with documentType
     * New format: POST /api/upload-document/{twinId} with JSON body including documentType
     */
    async uploadPDFDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'semi-estructurado'
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento PDF con nuevo formato para twin: ${twinId}`);
            console.log(`📋 Categoría: ${subCategory}, Estructura: ${estructuraFiltro}`);

            // Convert file to base64
            const fileContent = await this.fileToBase64(file);
            console.log(`🔄 Archivo PDF convertido a base64, tamaño: ${fileContent.length} caracteres`);

            // Construct file path based on structure and subcategory
            // For invoice/facturas, use "semi-estructurado/invoice"
            let filePath = estructuraFiltro;
            if (subCategory === 'invoice' || subCategory === 'factura' || subCategory === 'Facturas') {
                filePath = 'semi-estructurado/invoice';
            } else if (subCategory && subCategory !== 'todas') {
                filePath = `${estructuraFiltro}/${subCategory}`;
            }

            // Get document type from subcategory
            const documentType = this.getDocumentTypeFromSubcategory(subCategory);

            console.log(`📁 File path construido para PDF: ${filePath}`);
            console.log(`📋 Document type mapeado para PDF: ${documentType}`);

            // Create JSON body in the new format
            const requestBody = {
                fileName: file.name,
                fileContent: fileContent,
                documentType: documentType,
                filePath: filePath
            };

            console.log('📋 Request body structure for PDF:', {
                fileName: requestBody.fileName,
                fileContentLength: requestBody.fileContent.length,
                documentType: requestBody.documentType,
                filePath: requestBody.filePath
            });

            const headers = this.getAuthHeaders();

            const response = await fetch(`${this.baseURL}/api/upload-document/${encodeURIComponent(twinId)}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Documento PDF subido exitosamente con nuevo formato y documentType');
            return result;
        } catch (error) {
            console.error('❌ Error uploading PDF document:', error);
            throw error;
        }
    }

    /**
     * Upload generic document using the new base64 format with documentType
     * New format: POST /api/upload-document/{twinId} with JSON body including documentType
     */
    async uploadDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'no-estructurado'
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento genérico con nuevo formato para twin: ${twinId}`);
            console.log(`📋 Categoría: ${subCategory}, Estructura: ${estructuraFiltro}`);

            // Convert file to base64
            const fileContent = await this.fileToBase64(file);
            console.log(`🔄 Archivo convertido a base64, tamaño: ${fileContent.length} caracteres`);

            // Construct file path based on structure and subcategory selected by user
            // Use exactly what the user selected in the filters, no automatic mapping
            let filePath: string;
            if (subCategory && subCategory !== 'todas' && estructuraFiltro !== 'todas') {
                // Use the exact structure and subcategory from user selection
                filePath = `${estructuraFiltro}/${subCategory}`;
                console.log(`📁 Usando ruta exacta de filtros del usuario: ${estructuraFiltro}/${subCategory}`);
            } else if (estructuraFiltro !== 'todas') {
                // Only structure is specified
                filePath = estructuraFiltro;
                console.log(`📁 Usando solo estructura: ${estructuraFiltro}`);
            } else {
                // Fallback to the provided structure type
                filePath = estructuraFiltro;
                console.log(`📁 Usando estructura por defecto: ${estructuraFiltro}`);
            }

            // Get document type from subcategory
            const documentType = this.getDocumentTypeFromSubcategory(subCategory);

            console.log(`📁 File path construido: ${filePath}`);
            console.log(`📋 Document type mapeado: ${documentType}`);

            // Create JSON body in the new format
            const requestBody = {
                fileName: file.name,
                fileContent: fileContent,
                documentType: documentType,
                filePath: filePath
            };

            console.log('📋 Request body structure:', {
                fileName: requestBody.fileName,
                fileContentLength: requestBody.fileContent.length,
                documentType: requestBody.documentType,
                filePath: requestBody.filePath
            });

            const headers = this.getAuthHeaders();

            const response = await fetch(`${this.baseURL}/api/upload-document/${encodeURIComponent(twinId)}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            console.log(`📊 Upload response status: ${response.status}`);
            console.log(`📊 Upload response headers:`, Object.fromEntries(response.headers.entries()));
            console.log(`📊 Upload response ok: ${response.ok}`);

            if (!response.ok) {
                let errorData: any;
                try {
                    const contentType = response.headers.get('content-type');
                    console.log(`📊 Error response content-type: ${contentType}`);
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                        console.error('❌ JSON error response:', errorData);
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Text error response:', errorText);
                        errorData = { error: errorText };
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing error response:', parseError);
                    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                }
                
                const errorMessage = errorData.error || errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // Intentar procesar la respuesta exitosa
            let result: any;
            try {
                const contentType = response.headers.get('content-type');
                console.log(`📊 Success response content-type: ${contentType}`);
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                    console.log('✅ JSON response parsed successfully:', result);
                } else {
                    const textResult = await response.text();
                    console.log('✅ Text response received:', textResult);
                    // Intentar parsear como JSON si es posible
                    try {
                        result = JSON.parse(textResult);
                        console.log('✅ Text successfully parsed as JSON:', result);
                    } catch {
                        // Si no es JSON válido, crear un objeto de respuesta
                        result = { success: true, message: textResult };
                        console.log('✅ Text response wrapped in object:', result);
                    }
                }
            } catch (parseError) {
                console.error('❌ Error parsing success response:', parseError);
                // Si no podemos parsear la respuesta, asumir éxito básico
                result = { success: true, message: 'Upload completed but response parsing failed' };
            }

            console.log('✅ Documento genérico subido exitosamente con nuevo formato y documentType');
            console.log('📋 Final processed result:', result);
            return result;
        } catch (error) {
            console.error('❌ Error uploading document:', error);
            throw error;
        }
    }

    /**
     * Upload CSV document using specific CSV endpoint with base64 format
     * Uses POST /api/upload-document-csv/{twinId} with JSON body
     */
    async uploadCSVDocument(
        twinId: string, 
        file: File
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📊 Subiendo CSV con formato base64 para twin: ${twinId}`);
            console.log(`� Archivo: ${file.name}, Tamaño: ${(file.size / 1024).toFixed(2)} KB`);

            // Convert file to base64 like other methods
            const fileContent = await this.fileToBase64(file);
            console.log(`🔄 CSV convertido a base64, tamaño: ${fileContent.length} caracteres`);

            // Create JSON body with base64 content (same pattern as other methods)
            const requestBody = {
                fileName: file.name,
                fileContent: fileContent,
                filePath: 'estructurado/CSV',
                documentType: 'CSV'
            };

            console.log('📋 Request body structure for CSV:', {
                fileName: requestBody.fileName,
                fileContentLength: requestBody.fileContent.length,
                filePath: requestBody.filePath,
                documentType: requestBody.documentType
            });

            const headers = this.getAuthHeaders();

            const response = await fetch(`${this.baseURL}/api/upload-document-csv/${encodeURIComponent(twinId)}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            console.log(`📊 CSV Upload response status: ${response.status}`);
            console.log(`📊 CSV Upload response ok: ${response.ok}`);

            if (!response.ok) {
                let errorData: any;
                try {
                    const contentType = response.headers.get('content-type');
                    console.log(`📊 CSV Error response content-type: ${contentType}`);
                    
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                    } else {
                        const errorText = await response.text();
                        errorData = { error: errorText };
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing CSV upload error response:', parseError);
                    errorData = { error: `HTTP ${response.status}: Error parsing response` };
                }
                
                console.error('❌ CSV Upload error data:', errorData);
                const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // Procesar respuesta exitosa (same pattern as other methods)
            let result: any;
            try {
                const contentType = response.headers.get('content-type');
                console.log(`📊 CSV Success response content-type: ${contentType}`);
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                    console.log('✅ CSV JSON response parsed successfully:', result);
                } else {
                    const textResult = await response.text();
                    console.log('✅ CSV Text response received:', textResult);
                    // Intentar parsear como JSON
                    try {
                        result = JSON.parse(textResult);
                        console.log('✅ CSV Text successfully parsed as JSON:', result);
                    } catch {
                        result = {
                            success: true,
                            message: textResult || 'CSV subido exitosamente',
                            fileName: file.name
                        };
                    }
                }
            } catch (parseError) {
                console.error('❌ Error parsing CSV success response:', parseError);
                result = {
                    success: true,
                    message: 'CSV subido exitosamente',
                    fileName: file.name
                };
            }

            console.log('✅ CSV subido exitosamente con formato base64');
            console.log('📋 CSV Final processed result:', result);
            return result;
        } catch (error) {
            console.error('❌ Error uploading CSV document:', error);
            throw error;
        }
    }

    /**
     * Get document content/download document
     */
    async downloadDocument(twinId: string, filePath: string): Promise<Blob> {
        try {
            console.log(`📥 Descargando documento: ${filePath} para twin: ${twinId}`);
            
            const headers = this.getAuthHeaders();
            // Remove Content-Type for blob response
            delete headers['Content-Type'];

            const response = await fetch(`${this.baseURL}/api/download-document/${twinId}/${encodeURIComponent(filePath)}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const blob = await response.blob();
            console.log('✅ Documento descargado exitosamente');
            return blob;
        } catch (error) {
            console.error('❌ Error downloading document:', error);
            throw error;
        }
    }

    /**
     * Get all documents for a specific twin using the list-documents endpoint
     */
    async getAllTwinDocumentsFromList(twinId: string): Promise<DocumentInfo[]> {
        try {
            console.log(`📋 Obteniendo todos los documentos via list-documents para twin: ${twinId}`);

            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.baseURL}/api/list-documents/${twinId}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ Respuesta del endpoint list-documents:`, result);
            
            // El endpoint devuelve la estructura { success, documents, count, filters }
            if (result.success && Array.isArray(result.documents)) {
                console.log(`📋 Documentos de list-documents obtenidos exitosamente: ${result.documents.length} documentos`);
                
                // Convertir documentos del list-documents al formato DocumentInfo esperado por la UI
                const documentInfos: DocumentInfo[] = result.documents.map((doc: any, index: number) => ({
                    filename: doc.id || `documento-${index + 1}`, // Usar id como filename
                    file_path: doc.id || '', // Usar id como path identificador
                    public_url: '', // No disponible en documentos procesados
                    last_modified: doc.createdAt ? new Date(doc.createdAt * 1000).toISOString() : new Date().toISOString(),
                    size_bytes: 0, // No disponible en documentos procesados
                    // Campos adicionales específicos de documentos procesados
                    allDocumentData: doc // Guardamos toda la información del documento para filtrado local
                }));
                
                return documentInfos;
            } else {
                console.log('📋 No se encontraron documentos o respuesta inválida en list-documents');
                return [];
            }
        } catch (error) {
            console.error('❌ Error getting twin documents from list-documents:', error);
            // Devolver array vacío en caso de error para evitar crashes en la UI
            return [];
        }
    }

    /**
     * List documents for a specific directory using the new directory-based endpoint
     * Example: getDocumentsByDirectory('TWN001', 'semi-structured', 'invoices')
     * Results in: /api/list-documents/TWN001/documents%252Fsemi-structured%252Finvoices
     */
    async getDocumentsByDirectory(
        twinId: string, 
        structureType: string, 
        subcategory: string
    ): Promise<DocumentInfo[]> {
        console.log(`📁 Obteniendo documentos por directorio:`, { twinId, structureType, subcategory });
        
        // Use the enhanced getAllTwinDocuments with filtering
        return this.getAllTwinDocuments(twinId, structureType, subcategory);
    }

    /**
     * Get all documents for a specific twin using the list-documents endpoint
     * Now supports directory-based filtering using the new URL format
     */
    async getAllTwinDocuments(
        twinId: string, 
        estructuraFiltro?: string, 
        subcategoriaFiltro?: string
    ): Promise<DocumentInfo[]> {
        try {
            let fullUrl: string;
            
            // Check if we should use directory-based filtering
            if (estructuraFiltro && subcategoriaFiltro) {
                const directoryPath = this.getDirectoryPath(estructuraFiltro, subcategoriaFiltro);
                
                if (directoryPath) {
                    // Use directory-based endpoint
                    const encodedPath = encodeURIComponent(encodeURIComponent(directoryPath));
                    fullUrl = `${this.baseURL}/api/list-documents/${twinId}/${encodedPath}`;
                    console.log(`📁 Usando endpoint por directorio: ${directoryPath}`);
                    console.log(`🔗 Path encoded: ${encodedPath}`);
                } else {
                    // Use general endpoint
                    fullUrl = `${this.baseURL}/api/list-documents/${twinId}`;
                    console.log(`📂 Usando endpoint general (sin filtros específicos)`);
                }
            } else {
                // Use general endpoint
                fullUrl = `${this.baseURL}/api/list-documents/${twinId}`;
                console.log(`📂 Usando endpoint general`);
            }
            
            console.log(`📋 Obteniendo todos los documentos para twin: ${twinId}`);
            console.log(`🌐 URL completa utilizada: ${fullUrl}`);

            const headers = this.getAuthHeaders();
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ Respuesta del endpoint list-documents:`, result);
            
            // DEBUG: Mostrar la estructura exacta del primer documento/file
            if (result && result.files && result.files.length > 0) {
                console.log(`🔍 DEBUG: Estructura completa del primer archivo (nueva estructura):`, result.files[0]);
                console.log(`🔍 DEBUG: Todas las claves disponibles:`, Object.keys(result.files[0]));
                
                // Mostrar también los campos anidados si existen
                if (result.files[0].metadata) {
                    console.log(`🔍 DEBUG: Claves en metadata:`, Object.keys(result.files[0].metadata));
                }
            } else if (result && result.documents && result.documents.length > 0) {
                console.log(`🔍 DEBUG: Estructura completa del primer documento (estructura anterior):`, result.documents[0]);
                console.log(`🔍 DEBUG: Todas las claves disponibles:`, Object.keys(result.documents[0]));
                
                // Mostrar también los campos anidados si existen
                if (result.documents[0].metadata) {
                    console.log(`🔍 DEBUG: Claves en metadata:`, Object.keys(result.documents[0].metadata));
                }
            }
            
            // El endpoint puede devolver un objeto con documentos o directamente un array
            let documentsArray: any[] = [];
            
            if (Array.isArray(result)) {
                // Respuesta directa como array
                documentsArray = result;
            } else if (result && Array.isArray(result.files)) {
                // Nueva respuesta con propiedad files (ListDocumentsResponse)
                documentsArray = result.files;
                console.log(`📁 Nueva estructura del backend detectada - Total files: ${result.totalFiles}, Directory: ${result.directory}`);
            } else if (result && Array.isArray(result.documents)) {
                // Respuesta como objeto con propiedad documents (formato anterior)
                documentsArray = result.documents;
            } else if (result && result.success && Array.isArray(result.documents)) {
                // Respuesta con success flag y documents (formato anterior)
                documentsArray = result.documents;
            } else if (result && result.success && Array.isArray(result.files)) {
                // Respuesta con success flag y files (nueva estructura)
                documentsArray = result.files;
                console.log(`📁 Nueva estructura del backend con success flag - Total files: ${result.totalFiles}, Directory: ${result.directory}`);
            }
            
            if (documentsArray.length > 0) {
                console.log(`📋 Documentos con metadatos obtenidos exitosamente: ${documentsArray.length} documentos`);
                
                // Convertir documentos con metadatos al formato DocumentInfo esperado por la UI
                const documentInfos: DocumentInfo[] = documentsArray.map((doc: any, index: number) => {
                    
                    // DEBUG: Mostrar estructura de cada documento
                    console.log(`🔍 DEBUG: Procesando documento ${index + 1}:`, {
                        originalDoc: doc,
                        availableKeys: Object.keys(doc),
                        // Buscar posibles nombres de archivo en diferentes campos
                        possibleFilenames: {
                            filename: doc.filename,
                            name: doc.name,
                            file_name: doc.file_name,
                            blob_name: doc.blob_name,
                            original_filename: doc.original_filename,
                            document_name: doc.document_name,
                            title: doc.title
                        },
                        // Buscar información de archivos en diferentes campos
                        fileInfo: {
                            file_path: doc.file_path,
                            path: doc.path,
                            blob_path: doc.blob_path,
                            public_url: doc.public_url,
                            url: doc.url,
                            download_url: doc.download_url
                        },
                        metadata: doc.metadata
                    });
                    
                    // Intentar extraer el nombre del archivo de diferentes fuentes posibles
                    // PRIORIDAD: metadata.fileName contiene el nombre real del archivo
                    const filename = doc.metadata?.fileName || 
                                   doc.id || // El ID también es descriptivo: "MicrosoftInvoiceJuly24"
                                   doc.blob_name || doc.original_filename || doc.document_name || doc.title || 
                                   doc.filename || doc.name || doc.file_name || 
                                   // También buscar en la URL si contiene el nombre del archivo
                                   (doc.metadata?.documentUrl && doc.metadata.documentUrl.includes('/') ? 
                                    decodeURIComponent(doc.metadata.documentUrl.split('/').pop()?.split('?')[0] || '') : null) ||
                                   (doc.public_url && doc.public_url.includes('/') ? 
                                    doc.public_url.split('/').pop() : null) ||
                                   (doc.file_path && doc.file_path.includes('/') ? 
                                    doc.file_path.split('/').pop() : null) ||
                                   `documento-${index + 1}`;
                    
                    console.log(`🔍 DEBUG: Nombre de archivo determinado: "${filename}" para documento ${index + 1}`);
                    
                    // Intentar extraer el tamaño del archivo
                    const size_bytes = doc.size_bytes || doc.size || doc.file_size || 0;
                    
                    // Intentar extraer las URLs - priorizar la URL del metadata que es la correcta
                    const file_path = doc.metadata?.blobPath || doc.metadata?.originalPath || doc.file_path || doc.path || doc.blob_path || '';
                    const public_url = doc.metadata?.documentUrl || doc.public_url || doc.url || doc.download_url || doc.blob_url || '';
                    
                    // Intentar extraer la fecha de modificación
                    const last_modified = doc.metadata?.uploadedAt || doc.metadata?.extractedAt || doc.last_modified || doc.modified_date || doc.created_at || doc.upload_date || new Date().toISOString();
                    
                    // Extraer metadatos - el documento tiene metadata rica
                    const metadata = doc.metadata || doc;
                    
                    // Mejorar la clasificación del tipo de documento basado en el análisis del backend
                    // El backend ya procesó el documento, usemos esa información
                    let improvedDocType = 'factura'; // Podemos inferir que es una factura por el contenido
                    let improvedStructureType = 'semi-structured'; // Las facturas son semi-estructuradas
                    let improvedSubCategory = 'invoice'; // Subcategoría específica
                    
                    // Si el documento contiene información de factura, clasificarlo correctamente
                    if (doc.structuredData && doc.structuredData.invoice_info) {
                        improvedDocType = 'factura';
                        improvedStructureType = 'semi-structured';
                        improvedSubCategory = 'invoice';
                    } else if (filename && filename.toLowerCase().includes('contract')) {
                        improvedDocType = 'contract';
                        improvedStructureType = 'structured';
                        improvedSubCategory = 'contract';
                    } else if (filename && filename.toLowerCase().includes('report')) {
                        improvedDocType = 'report';
                        improvedStructureType = 'structured';
                        improvedSubCategory = 'report';
                    } else {
                        // Usar clasificación basada en filename si no hay datos estructurados
                        if (filename) {
                            const fileExt = filename.toLowerCase();
                            if (fileExt.includes('invoice') || fileExt.includes('factura')) {
                                improvedDocType = 'factura';
                                improvedStructureType = 'semi-structured';
                                improvedSubCategory = 'invoice';
                            } else if (fileExt.includes('contract') || fileExt.includes('contrato')) {
                                improvedDocType = 'contract';
                                improvedStructureType = 'structured';
                                improvedSubCategory = 'contract';
                            } else if (fileExt.includes('report') || fileExt.includes('reporte')) {
                                improvedDocType = 'report';
                                improvedStructureType = 'structured';
                                improvedSubCategory = 'report';
                            } else if (fileExt.includes('.pdf')) {
                                improvedDocType = 'document';
                                improvedStructureType = 'semi-structured';
                                improvedSubCategory = 'document';
                            }
                        }
                    }
                    
                    const documentInfo: DocumentInfo = {
                        id: doc.id || filename,
                        filename: filename,
                        size_bytes: size_bytes,
                        file_path: file_path,
                        public_url: public_url,
                        last_modified: last_modified,
                        document_type: improvedDocType,
                        structure_type: improvedStructureType,
                        sub_category: improvedSubCategory,
                        content_summary: doc.fullTextContent || doc.content_summary || 'No hay resumen disponible',
                        language: metadata.language || 'es',
                        pages: metadata.pages || 1,
                        
                        // Metadatos con TODOS los datos ricos del backend
                        metadata: {
                            // Campos básicos
                            document_type: improvedDocType,
                            structure_type: improvedStructureType,
                            sub_category: improvedSubCategory,
                            content_type: metadata.content_type || metadata.mime_type || 'application/octet-stream',
                            processing_status: metadata.processing_status || metadata.status || 'processed',
                            extracted_text: metadata.extracted_text || metadata.text_content || doc.fullTextContent || '',
                            extracted_data: metadata.extracted_data || metadata.structured_data || doc.structuredData,
                            tags: metadata.tags || [],
                            created_at: metadata.created_at || metadata.created || last_modified,
                            updated_at: metadata.updated_at || metadata.updated || last_modified,
                            
                            // DATOS RICOS del análisis del backend 🎯
                            documentUrl: metadata.documentUrl || public_url, // SAS URL
                            htmlReport: doc.htmlReport, // HTML procesado
                            structuredData: doc.structuredData, // Datos estructurados (info de factura)
                            fullTextContent: doc.fullTextContent, // Texto completo extraído
                            tablesContent: doc.tablesContent, // Contenido de tablas
                            analysisModel: metadata.analysisModel || 'gpt-4o-mini',
                            extractedAt: metadata.extractedAt,
                            uploadedAt: metadata.uploadedAt,
                            blobPath: metadata.blobPath,
                            originalPath: metadata.originalPath,
                            fileName: metadata.fileName || filename,
                            
                            // Campos específicos para la UI
                            sasUrl: metadata.documentUrl || public_url, // Campo específico para navegación
                            AiExecutiveSummaryHtml: doc.htmlReport // Campo específico para resumen IA
                        }
                    };
                    
                    console.log(`✅ DocumentInfo con datos ricos creado:`, {
                        id: documentInfo.id,
                        filename: documentInfo.filename,
                        hasHtmlReport: !!documentInfo.metadata?.htmlReport,
                        hasStructuredData: !!documentInfo.metadata?.structuredData,
                        hasFullText: !!documentInfo.metadata?.fullTextContent,
                        hasTables: !!documentInfo.metadata?.tablesContent,
                        sasUrl: documentInfo.metadata?.documentUrl
                    });
                    
                    return documentInfo;
                });
                
                return documentInfos;
            } else {
                console.log('📋 Respuesta no es un array o está vacía');
                return [];
            }
        } catch (error) {
            console.error('❌ Error getting twin documents:', error);
            // Devolver array vacío en caso de error para evitar crashes en la UI
            return [];
        }
    }

    /**
     * Get specific document metadata by filename for TwinAgent
     */
    async getDocumentMetadata(twinId: string, filename: string): Promise<{
        success: boolean;
        data?: DocumentInfo;
        error?: string;
    }> {
        try {
            console.log(`🔍 TwinAgent - Buscando documento: ${filename} para twin: ${twinId}`);
            
            // USAR COSMOS DB DIRECTAMENTE para obtener URLs válidas
            const cosmosDocuments = await this.getAllDocumentsFromCosmosDB(twinId, 'all');
            
            // Buscar el documento específico por nombre de archivo (usando FilePath completo)
            const document = cosmosDocuments.find(doc => 
                doc.filename === filename ||
                doc.metadata?.fileName === filename ||
                doc.filename?.includes(filename) ||
                doc.metadata?.fileName?.includes(filename)
            );
            
            if (document) {
                console.log(`✅ TwinAgent - Documento encontrado en Cosmos DB:`, {
                    filename: document.filename,
                    hasMetadata: !!document.metadata,
                    sasUrl: document.metadata?.sasUrl,
                    documentUrl: document.metadata?.documentUrl,
                    hasHtmlReport: !!document.metadata?.htmlReport,
                    hasStructuredData: !!document.metadata?.structuredData,
                    hasAiExecutiveSummaryHtml: !!document.metadata?.AiExecutiveSummaryHtml
                });
                
                return {
                    success: true,
                    data: document
                };
            } else {
                console.log(`❌ TwinAgent - Documento no encontrado en Cosmos DB: ${filename}`);
                console.log(`📋 TwinAgent - Documentos disponibles en Cosmos DB:`, cosmosDocuments.map(d => ({
                    filename: d.filename,
                    fileName: d.metadata?.fileName
                })));
                
                // Fallback: intentar con getAllTwinDocuments (list-documents)
                console.log('🔄 TwinAgent - Probando con list-documents como fallback...');
                const allDocuments = await this.getAllTwinDocuments(twinId);
                
                const fallbackDocument = allDocuments.find(doc => 
                    doc.filename === filename ||
                    doc.metadata?.fileName === filename
                );
                
                if (fallbackDocument) {
                    console.log(`✅ TwinAgent - Documento encontrado en list-documents (fallback):`, {
                        filename: fallbackDocument.filename,
                        hasMetadata: !!fallbackDocument.metadata
                    });
                    
                    return {
                        success: true,
                        data: fallbackDocument
                    };
                }
                
                return {
                    success: false,
                    error: `Documento "${filename}" no encontrado ni en Cosmos DB ni en list-documents`
                };
            }
            
        } catch (error) {
            console.error('❌ TwinAgent - Error obteniendo metadatos del documento:', error);
            return {
                success: false,
                error: 'Error al obtener metadatos del documento desde Cosmos DB'
            };
        }
    }

    /**
     * Get all documents from Cosmos DB by document type
     * Calls the GetAllDocumentsFromCosmosDB Azure Function
     */
    async getAllDocumentsFromCosmosDB(twinId: string, documentType: string): Promise<DocumentInfo[]> {
        try {
            console.log(`🚀 Llamando a GetAllDocumentsFromCosmosDB - Twin ID: ${twinId}, Document Type: ${documentType}`);
            
            const url = `${this.baseURL}/api/documents-cosmos/${twinId}/${encodeURIComponent(documentType)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Respuesta de GetAllDocumentsFromCosmosDB:`, data);

            // Verificar si la respuesta tiene la nueva estructura CosmosDocumentsListResponse
            if (data && data.success && data.documents && Array.isArray(data.documents)) {
                console.log(`📊 Nueva estructura de respuesta detectada: ${data.totalDocuments} documentos disponibles`);
                
                // Mapear CosmosDocumentSummary[] a DocumentInfo[]
                const documentInfos: DocumentInfo[] = data.documents.map((doc: any) => {
                    // Función helper para parsing seguro de JSON
                    const safeJSONParse = (text: string | null | undefined, fallback: any = null, fieldName: string = 'unknown') => {
                        if (!text || typeof text !== 'string') return fallback;
                        try {
                            return JSON.parse(text);
                        } catch (error) {
                            console.warn(`⚠️ Error parsing JSON para campo "${fieldName}", contenido: "${text.substring(0, 50)}...", usando fallback:`, error);
                            return fallback;
                        }
                    };

                    const documentInfo: DocumentInfo = {
                        id: doc.id || doc.Id,
                        filename: doc.filePath || doc.FilePath || doc.fileName || doc.FileName, // Usar filePath completo como filename
                        file_path: doc.filePath || doc.FilePath || '',
                        public_url: doc.sasUrl || doc.filePath || doc.FilePath || '', // Usar sasUrl como URL principal
                        last_modified: doc.processedAt || doc.ProcessedAt || doc.createdAt || doc.CreatedAt || new Date().toISOString(),
                        size_bytes: doc.fileSize || doc.FileSize || doc.contentLength || doc.ContentLength || 0, // Intentar varios campos de tamaño
                        document_type: documentType, // Usar el tipo solicitado
                        structure_type: 'semi-structured', // Asumir semi-estructurado para facturas
                        sub_category: documentType.toLowerCase(),
                        content_summary: doc.aiExecutiveSummaryText || doc.AiExecutiveSummaryText || doc.aiTextSummary || doc.AiTextSummary || '',
                        language: 'es', // Asumir español
                        pages: doc.totalPages || doc.TotalPages || 0,
                        metadata: {
                            // Información básica del documento
                            document_type: documentType,
                            structure_type: 'semi-structured',
                            sub_category: documentType.toLowerCase(),
                            content_type: 'application/pdf',
                            processing_status: doc.success || doc.Success ? 'completed' : 'failed',
                            created_at: doc.createdAt || doc.CreatedAt,
                            updated_at: doc.processedAt || doc.ProcessedAt,
                            
                            // Datos ricos de AI - mapear desde CosmosDocumentSummary
                            documentUrl: doc.sasUrl || doc.filePath || doc.FilePath, // USAR SASURL PRIMERO
                            htmlReport: doc.aiExecutiveSummaryHtml || doc.AiExecutiveSummaryHtml || doc.aiHtmlOutput || doc.AiHtmlOutput, // USAR AiExecutiveSummaryHtml
                            structuredData: safeJSONParse(doc.aiStructuredData || doc.AiStructuredData, {}, 'aiStructuredData'),
                            fullTextContent: doc.aiProcessedText || doc.AiProcessedText || doc.aiTextReport || doc.AiTextReport,
                            tablesContent: safeJSONParse(doc.aiTablesContent || doc.AiTablesContent, [], 'aiTablesContent'),
                            
                            // Información específica de la factura (Document Intelligence)
                            vendorName: doc.vendorName || doc.VendorName,
                            vendorNameConfidence: doc.vendorNameConfidence || doc.VendorNameConfidence,
                            customerName: doc.customerName || doc.CustomerName,
                            customerNameConfidence: doc.customerNameConfidence || doc.CustomerNameConfidence,
                            invoiceNumber: doc.invoiceNumber || doc.InvoiceNumber,
                            invoiceDate: doc.invoiceDate || doc.InvoiceDate,
                            dueDate: doc.dueDate || doc.DueDate,
                            subTotal: doc.subTotal || doc.SubTotal,
                            subTotalConfidence: doc.subTotalConfidence || doc.SubTotalConfidence,
                            totalTax: doc.totalTax || doc.TotalTax,
                            invoiceTotal: doc.invoiceTotal || doc.InvoiceTotal,
                            invoiceTotalConfidence: doc.invoiceTotalConfidence || doc.InvoiceTotalConfidence,
                            lineItemsCount: doc.lineItemsCount || doc.LineItemsCount,
                            tablesCount: doc.tablesCount || doc.TablesCount,
                            
                            // Flags de AI
                            hasAiExecutiveSummary: doc.hasAiExecutiveSummary || doc.HasAiExecutiveSummary,
                            hasAiInvoiceAnalysis: doc.hasAiInvoiceAnalysis || doc.HasAiInvoiceAnalysis,
                            hasAiCompleteAnalysis: doc.hasAiCompleteAnalysis || doc.HasAiCompleteAnalysis,
                            aiDataFieldsCount: doc.aiDataFieldsCount || doc.AiDataFieldsCount,
                            
                            // Otros metadatos
                            fileName: doc.fileName || doc.FileName,
                            source: doc.source || doc.Source,
                            errorMessage: doc.errorMessage || doc.ErrorMessage,
                            
                            // SAS URL específico para acceso directo
                            sasUrl: doc.sasUrl,
                            
                            // Campo específico para la UI
                            AiExecutiveSummaryHtml: doc.aiExecutiveSummaryHtml || doc.AiExecutiveSummaryHtml || doc.aiHtmlOutput || doc.AiHtmlOutput
                        }
                    };
                    
                    console.log(`✅ DocumentInfo creado desde CosmosDocumentSummary:`, {
                        id: documentInfo.id,
                        filename: documentInfo.filename,
                        vendorName: doc.vendorName || doc.VendorName,
                        invoiceTotal: doc.invoiceTotal || doc.InvoiceTotal,
                        hasAiAnalysis: doc.hasAiCompleteAnalysis || doc.HasAiCompleteAnalysis,
                        totalPages: doc.totalPages || doc.TotalPages,
                        sasUrl: doc.sasUrl,
                        hasHtmlReport: !!(doc.aiExecutiveSummaryHtml || doc.AiExecutiveSummaryHtml)
                    });
                    
                    return documentInfo;
                });
                
                console.log(`📊 Total de documentos convertidos desde Cosmos DB: ${documentInfos.length}`);
                return documentInfos;
            } else {
                console.log('📋 Respuesta no tiene la estructura esperada o está vacía');
                return [];
            }
        } catch (error) {
            console.error('❌ Error obteniendo documentos desde Cosmos DB:', error);
            return [];
        }
    }

    /**
     * Upload education document (PDF) using the new base64 format
     * Specific for education documents: POST /api/upload-document/{twinId}
     * Sets documentType = "Education" and filePath = "educacion"
     */
    async uploadEducationDocument(
        twinId: string,
        educationId: string,
        file: File
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📚 Subiendo documento de educación para twin: ${twinId}, education: ${educationId}`);
            console.log(`📄 Archivo: ${file.name}, Tamaño: ${file.size} bytes`);

            // Validate file type
            if (file.type !== 'application/pdf') {
                throw new Error('Solo se permiten archivos PDF para documentos de educación');
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('El archivo no debe superar los 10MB');
            }

            // Convert file to base64
            const fileContent = await this.fileToBase64(file);
            console.log(`🔄 Archivo convertido a base64, tamaño: ${fileContent.length} caracteres`);

            // Keep original file name - let backend handle internal naming/organization
            const fileName = file.name;
            const filePath = 'educacion';

            // Create JSON body for education document
            const requestBody = {
                fileName: fileName,
                fileContent: fileContent,
                filePath: filePath,
                documentType: 'Education',
                educationId: educationId, // Include education ID for reference
                cosmosDbRecordId: educationId // Explicit field for Cosmos DB record ID
            };

            console.log('📋 Request body structure for education document:', {
                fileName: requestBody.fileName,
                fileContentLength: requestBody.fileContent.length,
                filePath: requestBody.filePath,
                documentType: requestBody.documentType,
                educationId: requestBody.educationId,
                cosmosDbRecordId: requestBody.cosmosDbRecordId
            });

            const headers = this.getAuthHeaders();
            console.log('🔑 Headers for education document upload:', headers);

            const response = await fetch(`${this.baseURL}/api/upload-document/${encodeURIComponent(twinId)}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            console.log(`📊 Education document upload response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Documento de educación subido exitosamente');
            return result;
        } catch (error) {
            console.error('❌ Error uploading education document:', error);
            throw error;
        }
    }

    /**
     * Get SAS URL for education document viewing
     */
    async getEducationDocumentSasUrl(containerName: string, documentId: string): Promise<{ success: boolean; sasUrl?: string; error?: string }> {
        try {
            console.log('🔗 Getting SAS URL for education document:', { containerName, documentId });

            const headers = this.getAuthHeaders();
            
            // Use the same endpoint pattern as other document operations
            const response = await fetch(`${this.baseURL}/api/documents/sas-url/${encodeURIComponent(containerName)}/${encodeURIComponent(documentId)}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error getting SAS URL:', errorText);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }

            const result = await response.json();
            console.log('✅ SAS URL obtenida exitosamente');
            
            return {
                success: true,
                sasUrl: result.sasUrl || result.url || result.documentUrl
            };
        } catch (error) {
            console.error('❌ Error getting education document SAS URL:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Search no-structured documents by structure and twin ID
     */
    async searchNoStructuredDocuments(twinId: string, estructura: string): Promise<NoStructuredSearchResult> {
        try {
            console.log(`🔍 Buscando documentos no estructurados - Twin ID: ${twinId}, Estructura: ${estructura}`);
            
            const url = `${this.baseURL}/api/search-no-structured-documents/${twinId}/${encodeURIComponent(estructura)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Respuesta de SearchNoStructuredDocuments:`, data);

            return data;
        } catch (error) {
            console.error('❌ Error en searchNoStructuredDocuments:', error);
            throw error;
        }
    }

    /**
     * Search no-structured documents metadata only (lightweight)
     */
    async searchNoStructuredDocumentsMetadata(twinId: string, estructura: string): Promise<NoStructuredSearchMetadataResult> {
        try {
            console.log(`🔍 Buscando metadatos de documentos no estructurados - Twin ID: ${twinId}, Estructura: ${estructura}`);
            
            const url = `${this.baseURL}/api/search-no-structured-documents-metadata/${twinId}/${encodeURIComponent(estructura)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Respuesta de SearchNoStructuredDocumentsMetadata:`, data);

            return data;
        } catch (error) {
            console.error('❌ Error en searchNoStructuredDocumentsMetadata:', error);
            throw error;
        }
    }

    /**
     * Answer a search question using AI Agent for a specific document
     */
    async answerSearchQuestion(
        twinId: string, 
        fileName: string, 
        question: string,
        model: string = 'gpt-5-mini',
        language: string = 'Spanish'
    ): Promise<TwinAgentDocumentResponse> {
        try {
            console.log(`🤖 Enviando pregunta al AI Agent - Twin ID: ${twinId}, Archivo: ${fileName}`);
            console.log(`❓ Pregunta: ${question}`);
            console.log(`🤖 Modelo: ${model}`);
            console.log(`🌐 Idioma: ${language}`);
            
            const url = `${this.baseURL}/api/answer-search-question/${twinId}/${encodeURIComponent(fileName)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const requestBody: TwinAgentDocumentRequest = {
                question: question,
                ModeloNombre: model,
                Idioma: language
            };
            
            console.log(`📤 Cuerpo de la solicitud:`, requestBody);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`, errorText);
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: TwinAgentDocumentResponse = await response.json();
            console.log(`✅ Respuesta del AI Agent:`, data);
            console.log(`🎯 Respuesta procesada - Pregunta: "${data.question}"`);
            console.log(`💬 Respuesta: "${data.answer}"`);
            console.log(`⏱️ Tiempo de procesamiento: ${data.processingTimeMs}ms`);
            console.log(`📅 Procesado en: ${data.processedAt}`);

            return data;
        } catch (error) {
            console.error('❌ Error en answerSearchQuestion:', error);
            throw error;
        }
    }

    /**
     * Get a specific no-structured document by documentId and twinId
     */
    async getNoStructuredDocument(twinId: string, documentId: string): Promise<GetNoStructuredDocumentResponse> {
        try {
            console.log(`📄 Obteniendo documento no estructurado - Twin ID: ${twinId}, Document ID: ${documentId}`);
            
            const url = `${this.baseURL}/api/get-no-structured-document/${twinId}/${encodeURIComponent(documentId)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: GetNoStructuredDocumentResponse = await response.json();
            console.log(`✅ Respuesta de GetNoStructuredDocument:`, data);

            return data;
        } catch (error) {
            console.error('❌ Error en getNoStructuredDocument:', error);
            throw error;
        }
    }

    /**
     * Delete a specific no-structured document by documentId and twinId
     */
    async deleteNoStructuredDocument(twinId: string, documentId: string): Promise<DeleteNoStructuredDocumentResponse> {
        try {
            console.log(`🗑️ Eliminando documento no estructurado - Twin ID: ${twinId}, Document ID: ${documentId}`);
            
            const url = `${this.baseURL}/api/delete-no-structured-document/${twinId}/${encodeURIComponent(documentId)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: DeleteNoStructuredDocumentResponse = await response.json();
            console.log(`✅ Respuesta de DeleteNoStructuredDocument:`, data);

            return data;
        } catch (error) {
            console.error('❌ Error en deleteNoStructuredDocument:', error);
            throw error;
        }
    }

    /**
     * Get invoices metadata for a specific twin using the optimized endpoint
     * @param twinId - The twin ID
     * @returns Promise with invoices metadata response
     */
    async getInvoicesMetadata(twinId: string): Promise<InvoicesMetadataResponse> {
        try {
            console.log(`📊 Obteniendo metadata de facturas - Twin ID: ${twinId}`);
            
            const url = `${this.baseURL}/api/invoices-metadata/${twinId}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`, errorText);
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: InvoicesMetadataResponse = await response.json();
            console.log(`✅ Metadata de facturas obtenida:`, data);
            console.log(`📊 Total de facturas: ${data.totalInvoices}`);
            console.log(`💰 Resumen: Total Amount: ${data.summary.totalAmount}, Average: ${data.summary.averageAmount}`);

            return data;
        } catch (error) {
            console.error('❌ Error en getInvoicesMetadata:', error);
            throw error;
        }
    }

    /**
     * Get a specific invoice by ID using the optimized endpoint
     * @param twinId - The twin ID
     * @param documentId - The document/invoice ID
     * @returns Promise with specific invoice details
     */
    async getInvoiceById(twinId: string, documentId: string): Promise<any> {
        try {
            console.log(`📄 Obteniendo factura específica - Twin ID: ${twinId}, Document ID: ${documentId}`);
            
            const url = `${this.baseURL}/api/invoice/${twinId}/${documentId}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`, errorText);
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: any = await response.json();
            console.log(`✅ Factura específica obtenida:`, data);
            console.log(`� Estructura completa de la respuesta:`, JSON.stringify(data, null, 2));
            console.log(`�📋 Nombre archivo: ${data.Invoice?.fileName}`);
            console.log(`💰 Total: ${data.Invoice?.invoiceTotal || data.Invoice?.totalAmount}`);
            console.log(`🏢 Vendor: ${data.Invoice?.vendorName}`);
            console.log(`🔑 Propiedades del objeto Invoice:`, Object.keys(data.Invoice || {}));
            console.log(`🔑 Propiedades del objeto raíz:`, Object.keys(data || {}));

            return data;
        } catch (error) {
            console.error('❌ Error en getInvoiceById:', error);
            throw error;
        }
    }

    /**
     * AI Analysis for invoices by vendor
     * @param twinId - The twin ID
     * @param vendorName - The vendor name
     * @param question - The question to ask
     * @param fileId - Optional file ID (default "null")
     * @returns Promise with AI analysis response
     */
    async aiInvoicesAnalysis(twinId: string, vendorName: string, question: string, fileId: string = "null"): Promise<AiInvoicesAnalysisResponse> {
        try {
            console.log(`🤖 Iniciando análisis AI de facturas - Twin ID: ${twinId}, Vendor: ${vendorName}`);
            console.log(`❓ Pregunta: ${question}`);
            
            const url = `${this.baseURL}/api/ai-invoices-analysis/${twinId}/${encodeURIComponent(vendorName)}`;
            console.log(`🌐 URL completa: ${url}`);
            
            const requestBody: AnalysisRequest = {
                Question: question,
                FileID: fileId
            };

            console.log(`📤 Request body:`, requestBody);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`, errorText);
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const data: AiInvoicesAnalysisResponse = await response.json();
            console.log(`✅ Análisis AI completado:`, data);
            
            return data;
        } catch (error) {
            console.error('❌ Error en aiInvoicesAnalysis:', error);
            throw error;
        }
    }
}

// Interfaces for the new search functionality
export interface NoStructuredSearchResult {
    success: boolean;
    error?: string;
    documents: NoStructuredDocument[];
    totalChapters: number;
    totalDocuments: number;
    searchQuery: string;
    searchType: string;
    message?: string;
}

export interface NoStructuredSearchMetadataResult {
    success: boolean;
    error?: string;
    documents: NoStructuredDocumentMetadata[];
    totalChapters: number;
    totalDocuments: number;
    searchQuery: string;
    searchType: string;
    message?: string;
}

export interface NoStructuredDocumentMetadata {
    documentID: string;
    twinID: string;
    estructura: string;
    subcategoria: string;
    totalChapters: number;
    totalTokens: number;
    totalPages: number;
    processedAt: string;
    searchScore: number;
    documentTitle: string;
}

export interface NoStructuredDocument {
    documentID: string;
    twinID: string;
    estructura?: string;
    subcategoria?: string;
    totalChapters: number;
    totalPages?: number;
    totalTokens: number;
    processedAt: string;
    searchScore?: number;
    capitulos: NoStructuredSearchResultItem[];
    documentTitle?: string;
}

export interface NoStructuredSearchResultItem {
    id: string;
    documentID: string;
    capituloID: string;
    subTemaID: string;
    twinID: string;
    estructura?: string;
    total_Subtemas_Capitulo: number;
    textoCompleto: string;
    capituloPaginaDe: number;
    capituloPaginaA: number;
    capituloTotalTokens: number;
    capituloTimeSeconds: number;
    total_Palabras_Subtema: number;
    titleSubCapitulo: string;  // Cambió de 'nombre' a 'titleSubCapitulo'
    textoSubCapitulo: string;  // Cambió de 'texto' a 'textoSubCapitulo'
    descripcion: string;
    html: string;
    totalTokensCapitulo: number;
    dateCreated: string;
    // Campos adicionales que pueden existir pero no usamos
    titulo?: string;
    numeroCapitulo?: string;
    paginaDe?: number;
    paginaA?: number;
    nivel?: number;
    totalTokens?: number;
    textoCompletoHTML?: string;
    resumenEjecutivo?: string;
    preguntasFrecuentes?: string;
    processedAt?: string;
    searchScore: number;
    highlights: string[];
}

// Interface para ExractedChapterSubsIndex (como especifica el backend)
export interface ExtractedChapterSubsIndex {
    chapter: string;
    id: string;
    twinID: string;
    subcategoria: string;
    totalTokensDocument: number;
    fileName: string;
    filePath: string;
    chapterID: string;
    textChapter: string;
    fromPageChapter: number;
    toPageChapter: number;
    totalTokens: number;
    titleSub: string;
    textSub: string;
    totalTokensSub: number;
    fromPageSub: number;
    toPageSub: number;
    fileURL: string;
}

// Interface para la respuesta del endpoint GetNoStructuredDocument
export interface GetNoStructuredDocumentResponse {
    success: boolean;
    twinId: string;
    fileName: string;
    filePath: string;
    subcategoria: string;
    totalChapters: number;
    documentData: ExtractedChapterSubsIndex[];
    totalTokens: number;
    totalPages: number;
    chapters: ExtractedChapterSubsIndex[];
    message: string;
}

// Interface para el request del AI Agent (TwinAgentDocumentRequest)
export interface TwinAgentDocumentRequest {
    question: string;
    ModeloNombre?: string;
    Idioma?: string;
}

// Interface para la respuesta del AI Agent (TwinAgentDocumentResponse)
export interface TwinAgentDocumentResponse {
    success: boolean;
    question: string;
    answer: string;
    twinId: string;
    fileName: string;
    processingTimeMs: number;
    processedAt: string;
    errorMessage?: string;
}

// Interface para la respuesta del endpoint DeleteNoStructuredDocument
export interface DeleteNoStructuredDocumentResponse {
    success: boolean;
    documentId: string;
    deletedChaptersCount: number;
    totalChaptersFound: number;
    message: string;
    errors?: string[];
}

// Interface para el request del AI Invoices Analysis
export interface AnalysisRequest {
    Question: string;
    FileID?: string;
}

// Interface para la respuesta del AI Invoices Analysis
export interface AiInvoicesAnalysisResponse {
    success: boolean;
    twinId: string;
    vendorName: string;
    question: string;
    fileID: string;
    analysisResult: {
        aiResponse?: string;
        htmlContent?: string;
        fileID?: string;
        question?: string;
        [key: string]: any;
    };
    processingTimeSeconds: number;
    processedAt: string;
    message: string;
    features?: {
        azureAIAgent: string;
        languages: string;
        capabilities: string;
        scope: string;
        fileOptimization: string;
    };
    note?: string;
    errorMessage?: string;
}

// Export singleton instance
export const documentApiService = new DocumentAPIService();
export type { 
    DocumentUploadResponse, 
    DocumentListResponse, 
    DocumentListResponseWithStatus,
    DocumentAIAnalysisResponse, 
    DocumentInfo,
    InvoiceMetadata,
    InvoicesMetadataResponse,
    GetInvoiceByIdResponse
};
