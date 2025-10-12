interface DocumentListResponseWithStatus extends DocumentListResponse {
    success: boolean;
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
        this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7011';
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
}

// Export singleton instance
export const documentApiService = new DocumentAPIService();
export type { 
    DocumentUploadResponse, 
    DocumentListResponse, 
    DocumentListResponseWithStatus,
    DocumentAIAnalysisResponse, 
    DocumentInfo 
};
