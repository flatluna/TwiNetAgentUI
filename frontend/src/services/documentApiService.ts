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
    private apiKey: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7072';
        this.apiKey = import.meta.env.VITE_API_KEY || 'B509918774DDE22A5BF94EDB4F145CB6E06F1CBCCC49D492D27FFD4AC3667A71';
    }

    /**
     * Get Authorization header with API key
     */
    private getAuthHeaders(): Record<string, string> {
        return {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get Authorization header for FormData requests (without Content-Type)
     */
    private getAuthHeadersForFormData(): Record<string, string> {
        return {
            'X-API-Key': this.apiKey
            // No Content-Type for FormData - browser sets it automatically with boundary
        };
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
            console.log(`✅ ${result.documents?.length || 0} documentos encontrados`);
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
            console.log(`✅ ${result.documents?.length || 0} documentos estructurados encontrados`);
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
     * Upload document to Data Lake using the new upload endpoint
     * This is step 1 of the two-step process
     */
    async uploadDocumentToDataLake(
        file: File,
        twinId: string,
        filePath: string,
        fileName: string
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento al Data Lake...`);
            console.log(`📋 Twin ID: ${twinId}`);
            console.log(`📁 File Path: ${filePath}`);
            console.log(`📄 File Name: ${fileName}`);
            console.log(`💾 File Size: ${file.size} bytes`);

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('twin_id', twinId);
            formData.append('file_path', filePath);
            formData.append('file_name', fileName);

            // Debug FormData contents
            console.log('📋 FormData contents:');
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
                } else {
                    console.log(`  ${key}: "${value}"`);
                }
            }

            const headers = this.getAuthHeadersForFormData();
            console.log('🔑 Headers for upload:', headers);

            const response = await fetch(`${this.baseURL}/api/upload-document`, {
                method: 'POST',
                headers,
                body: formData
            });

            console.log(`📊 Upload response status: ${response.status}`);
            console.log(`📊 Upload response headers:`, Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorData: any;
                try {
                    const contentType = response.headers.get('content-type');
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

            const result = await response.json();
            console.log('✅ Documento subido exitosamente al Data Lake');
            console.log('📋 Response data:', result);
            
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
            const filePath = `${estructuraFiltro}/${subCategory}/${fileName}`;

            console.log(`📁 File path (sin twinId): ${filePath}`);
            console.log(`📄 File name (original): ${fileName}`);

            // PASO 1: Subir el archivo al Data Lake
            console.log(`📤 PASO 1: Subiendo archivo al Data Lake...`);
            
            let uploadResult: DocumentUploadResponse;
            try {
                uploadResult = await this.uploadDocumentToDataLake(
                    file,
                    containerName, // Usar containerName en lugar de twinId
                    filePath,
                    fileName
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
     * Upload PDF document with AI analysis (legacy direct upload method)
     */
    async uploadPDFDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'semi-estructurado'
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento PDF para twin: ${twinId}`);
            console.log(`📋 Categoría: ${subCategory}, Estructura: ${estructuraFiltro}`);

            const formData = new FormData();
            formData.append('twin_id', twinId);
            formData.append('file', file);
            formData.append('sub_category', subCategory);
            formData.append('estructura_filtro', estructuraFiltro);

            const headers = this.getAuthHeadersForFormData();

            const response = await fetch(`${this.baseURL}/api/upload-pdf-document`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Documento PDF subido exitosamente');
            return result;
        } catch (error) {
            console.error('❌ Error uploading PDF document:', error);
            throw error;
        }
    }

    /**
     * Upload generic document without AI analysis
     */
    async uploadDocument(
        twinId: string,
        file: File,
        subCategory: string,
        estructuraFiltro: string = 'no-estructurado'
    ): Promise<DocumentUploadResponse> {
        try {
            console.log(`📤 Subiendo documento genérico para twin: ${twinId}`);
            console.log(`📋 Categoría: ${subCategory}, Estructura: ${estructuraFiltro}`);

            const formData = new FormData();
            formData.append('twin_id', twinId);
            formData.append('file', file);
            formData.append('sub_category', subCategory);
            formData.append('estructura_filtro', estructuraFiltro);

            const headers = this.getAuthHeadersForFormData();

            const response = await fetch(`${this.baseURL}/api/upload-document`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Documento genérico subido exitosamente');
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
     * Get all documents for a specific twin using the list-documents endpoint
     */
    async getAllTwinDocuments(twinId: string): Promise<DocumentInfo[]> {
        try {
            const fullUrl = `${this.baseURL}/api/list-documents/${twinId}`;
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
            
            // DEBUG: Mostrar la estructura exacta del primer documento
            if (result && result.documents && result.documents.length > 0) {
                console.log(`🔍 DEBUG: Estructura completa del primer documento:`, result.documents[0]);
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
            } else if (result && Array.isArray(result.documents)) {
                // Respuesta como objeto con propiedad documents
                documentsArray = result.documents;
            } else if (result && result.success && Array.isArray(result.documents)) {
                // Respuesta con success flag y documents
                documentsArray = result.documents;
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
                            fileName: metadata.fileName || filename
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
            
            // Obtener todos los documentos del twin
            const allDocuments = await this.getAllTwinDocuments(twinId);
            
            // Buscar el documento específico por nombre de archivo
            const document = allDocuments.find(doc => 
                doc.filename === filename ||
                doc.metadata?.fileName === filename
            );
            
            if (document) {
                console.log(`✅ TwinAgent - Documento encontrado:`, {
                    filename: document.filename,
                    hasMetadata: !!document.metadata,
                    hasHtmlReport: !!document.metadata?.htmlReport,
                    hasStructuredData: !!document.metadata?.structuredData
                });
                
                return {
                    success: true,
                    data: document
                };
            } else {
                console.log(`❌ TwinAgent - Documento no encontrado: ${filename}`);
                console.log(`📋 TwinAgent - Documentos disponibles:`, allDocuments.map(d => d.filename));
                
                return {
                    success: false,
                    error: `Documento "${filename}" no encontrado en Cosmos DB`
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
