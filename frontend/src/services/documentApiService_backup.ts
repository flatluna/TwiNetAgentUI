/**
 * Document API service for handling personal files and documents
 */

interface DocumentUploadResponse {
    success: boolean;
    message: string;
    file_path?: string;
    public_url?: string;
    name?: string;
    size?: number;
    document_type?: string;
    documentId?: string; // Para orchestrator responses
    id?: string; // Para Azure Functions orchestrator response format
    file_name?: string; // Para el nuevo endpoint upload-document
    file_size?: number; // Para el nuevo endpoint upload-doc        try {
            console.log(`🚀 Iniciando proceso de orchestrator para twin: ${twinId}`);
            console.log(`📋 Categoría: ${subCategory}, Estructura: ${estructuraFiltro}`);

            // Normalizar el twinId al formato UUID con guiones
            const normalizedTwinId = this.normalizeUUID(twinId);
            console.log(`🔧 Twin ID normalizado: ${normalizedTwinId}`);

            // Construir la ruta del archivo con la estructura solicitada:
            // normalizedTwinId/Estructura/Subcategoría/archivo.pdf
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${normalizedTwinId}/${estructuraFiltro}/${subCategory}/${timestamp}_${sanitizedFileName}`;
            const fileName = sanitizedFileName;

            console.log(`📁 Estructura de carpetas: ${filePath}`);win_id?: string; // Para el nuevo endpoint upload-document
    upload_result?: string; // Para el nuevo endpoint upload-document
}

interface DocumentInfo {
    filename: string;
    file_path: string;
    public_url: string;
    last_modified?: string;
    size_bytes: number;
}

interface DocumentListResponse {
    success: boolean;
    documents: DocumentInfo[];
    total_documents: number;
    directory_path: string;
}

interface DocumentAIAnalysisResponse {
    success: boolean;
    documentId?: string;
    id?: string; // Para Azure Functions orchestrator response format
    twinId?: string;
    fileName?: string;
    documentType?: string;
    processedAt?: string;
    aiAnalysis?: {
        reporteHumano: string;
        analisisEjecutivo: string;
        confidence: string;
        analysisType: string;
        generatedAt?: string;
        extractionQuality?: any;
    };
    message?: string;
}

interface OrchestratorStatusResponse {
    success: boolean;
    status?: string;
    progress?: number;
    result?: any;
    message?: string;
}

class DocumentApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'http://localhost:7072';
    }

    /**
     * Upload an official document (passport, ID, license, etc.)
     */
    async uploadOfficialDocument(
        twinId: string, 
        file: File, 
        documentType: string = 'passport'
    ): Promise<DocumentUploadResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('document_type', documentType);

            const response = await fetch(
                `${this.baseUrl}/api/twins/${twinId}/documents/official/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error uploading official document:', error);
            throw error;
        }
    }

    /**
     * Upload a structured document (CSV, JSON, PDF, etc.) based on structure type
     */
    async uploadStructuredDocument(
        twinId: string, 
        file: File, 
        structureType: string, // 'estructurado', 'semi-estructurado', 'no-estructurado'
        subCategory: string    // 'csv', 'facturas', 'contratos', etc.
    ): Promise<DocumentUploadResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('structure_type', structureType);
            formData.append('sub_category', subCategory);

            const response = await fetch(
                `${this.baseUrl}/api/twins/${twinId}/documents/structured/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error uploading structured document:', error);
            throw error;
        }
    }

    /**
     * List all official documents for a twin
     */
    async listOfficialDocuments(twinId: string): Promise<DocumentListResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/twins/${twinId}/documents/official`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error listing official documents:', error);
            throw error;
        }
    }

    /**
     * List all structured documents for a twin
     */
    async listStructuredDocuments(
        twinId: string, 
        structureType?: string, 
        subCategory?: string
    ): Promise<DocumentListResponse> {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (structureType) params.append('structure_type', structureType);
            if (subCategory) params.append('sub_category', subCategory);
            
            const queryString = params.toString();
            const url = `${this.baseUrl}/api/twins/${twinId}/documents/structured${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error listing structured documents:', error);
            throw error;
        }
    }

    /**
     * Delete an official document
     */
    async deleteOfficialDocument(twinId: string, filename: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/twins/${twinId}/documents/official/${encodeURIComponent(filename)}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error deleting official document:', error);
            throw error;
        }
    }

    /**
     * Get content of a structured document
     */
    async getStructuredDocumentContent(twinId: string, filename: string): Promise<{ success: boolean; content?: string; error?: string }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/twins/${twinId}/documents/structured/${encodeURIComponent(filename)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            return { success: true, content };
        } catch (error) {
            console.error('❌ Error getting structured document content:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get AI analysis for a specific document
     */
    async getDocumentAIAnalysis(twinId: string, filename: string): Promise<DocumentAIAnalysisResponse> {
        try {
            console.log(`🧠 Getting AI analysis for document: ${filename} (twin: ${twinId})`);
            
            const encodedFilename = encodeURIComponent(filename);
            const response = await fetch(
                `${this.baseUrl}/api/twins/${twinId}/documents/${encodedFilename}/ai-analysis`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ AI analysis retrieved successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Error getting AI analysis:', error);
            throw error;
        }
    }

    /**
     * Process document completely: extract data, run AI analysis, save to Cosmos DB
     */
    async processDocumentComplete(
        documentUrl: string,
        twinId: string,
        documentCategory: string,
        modelId: string = 'prebuilt-layout'
    ): Promise<any> {
        try {
            console.log('🚀 Starting complete document processing...');
            
            const requestData = {
                documentUrl,
                twinId,
                documentCategory,
                modelId
            };

            const response = await fetch(`${this.baseUrl}/api/autogen/process-document-from-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Complete document processing completed:', result);
            return result;
        } catch (error) {
            console.error('❌ Error in complete document processing:', error);
            throw error;
        }
    }

    /**
     * Get file type icon based on extension
     */
    getFileTypeIcon(filename: string): string {
        if (!filename) {
            return '📄'; // Default icon for unknown files
        }
        
        const extension = filename.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'webp':
            case 'bmp':
            case 'tiff':
                return '🖼️';
            case 'doc':
            case 'docx':
                return '📝';
            default:
                return '📎';
        }
    }

    /**
     * Normaliza el twinId al formato UUID con guiones si es necesario
     * Convierte: 388a31e7d40840f0844c4d2efedaa836 -> 388a31e7-d408-40f0-844c-4d2efedaa836
     */
    private normalizeUUID(twinId: string): string {
        // Si ya tiene guiones, devuelve tal como está
        if (twinId.includes('-')) {
            console.log('🔄 UUID ya tiene formato correcto:', twinId);
            return twinId;
        }
        
        // Si no tiene guiones y tiene 32 caracteres, agrega los guiones
        if (twinId.length === 32) {
            const normalized = `${twinId.slice(0, 8)}-${twinId.slice(8, 12)}-${twinId.slice(12, 16)}-${twinId.slice(16, 20)}-${twinId.slice(20)}`;
            console.log('🔄 UUID normalizado:', twinId, '->', normalized);
            return normalized;
        }
        
        // Si no es un formato reconocido, devuelve tal como está
        console.log('⚠️ UUID en formato desconocido, manteniendo original:', twinId);
        return twinId;
    }

    /**
     * Upload document to Data Lake using the new endpoint
     * Step 1 of the orchestrator process
     */
    async uploadDocumentToDataLake(
        file: File,
        twinId: string,
        filePath: string,
        fileName: string
    ): Promise<DocumentUploadResponse> {
        try {
            // Validar archivo
            if (!file || file.size === 0) {
                throw new Error('Archivo inválido o vacío');
            }

            if (!file.name.toLowerCase().endsWith('.pdf')) {
                throw new Error('Solo se permiten archivos PDF');
            }

            if (file.size > 10 * 1024 * 1024) {
                throw new Error('El archivo es muy grande. Máximo 10MB');
            }

            // Verificar parámetros requeridos
            if (!twinId || twinId.trim() === '') {
                throw new Error('Twin ID es requerido');
            }

            if (!filePath || filePath.trim() === '') {
                throw new Error('File path es requerido');
            }

            if (!fileName || fileName.trim() === '') {
                throw new Error('File name es requerido');
            }

            console.log('✅ Validación de parámetros completa:', {
                twinId: twinId,
                filePath: filePath,
                fileName: fileName,
                fileSize: file.size
            });

            // Crear FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('twin_id', twinId);
            formData.append('file_path', filePath);
            formData.append('file_name', fileName);

            console.log('📤 Subiendo documento al Data Lake:', {
                twin_id: twinId,
                file_path: filePath,
                file_name: fileName,
                file_size: file.size
            });

            // Debug: También mostrar como se verán en la URL
            console.log('🔗 Parámetros URL encoding:', {
                twin_id_encoded: encodeURIComponent(twinId),
                file_path_encoded: encodeURIComponent(filePath),
                file_name_encoded: encodeURIComponent(fileName)
            });

            // Debug: Verificar contenido exacto del FormData
            console.log('🔍 FormData entries:');
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            // Construir URL con twin_id como query parameter también
            const uploadUrl = `${this.baseUrl}/api/upload-document?twin_id=${encodeURIComponent(twinId)}`;
            console.log('🌐 URL de upload:', uploadUrl);

            const response = await fetch(
                uploadUrl,
                {
                    method: 'POST',
                    body: formData
                    // No agregamos headers personalizados para evitar CORS preflight
                    // Los datos van en FormData y query parameter
                }
            );

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorData: any;
                const contentType = response.headers.get('content-type');
                
                console.log('❌ Response not OK - Status:', response.status, 'StatusText:', response.statusText);
                console.log('❌ Content-Type:', contentType);
                
                try {
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

            // Construir la ruta del archivo con la estructura solicitada:
            // twinId/Estructura/Subcategoría/archivo.pdf
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${twinId}/${estructuraFiltro}/${subCategory}/${timestamp}_${sanitizedFileName}`;
            const fileName = sanitizedFileName;

            console.log(`� Estructura de carpetas: ${filePath}`);

            // PASO 1: Subir el archivo al Data Lake
            console.log(`📤 PASO 1: Subiendo archivo al Data Lake...`);
            
            let uploadResult: DocumentUploadResponse;
            try {
                uploadResult = await this.uploadDocumentToDataLake(
                    file,
                    twinId,
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
                container_name: twinId, // El contenedor es el twinId
                file_path: uploadResult.file_path || filePath,
                file_name: uploadResult.file_name || uploadResult.name || fileName
            };

            console.log(`📋 Request body para orchestrator:`, requestBody);
            console.log(`📤 JSON enviado:`, JSON.stringify(requestBody, null, 2));

            // Validar JSON antes de enviar
            try {
                const jsonString = JSON.stringify(requestBody);
                const parsed = JSON.parse(jsonString);
                console.log('✅ JSON válido para orchestrator:', parsed);
            } catch (jsonError) {
                console.error('❌ JSON inválido para orchestrator:', jsonError);
                throw new Error('Error creando JSON request body para orchestrator');
            }

            let orchestratorResult: any;
            try {
                const response = await fetch(
                    `${this.baseUrl}/api/orchestrators/process_pdf_orchestrator`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    }
                );

                if (!response.ok) {
                    let errorData: any;
                    const contentType = response.headers.get('content-type');
                    
                    try {
                        if (contentType && contentType.includes('application/json')) {
                            errorData = await response.json();
                        } else {
                            const errorText = await response.text();
                            console.error('❌ Non-JSON error response from orchestrator:', errorText);
                            errorData = { detail: errorText || `HTTP ${response.status}: ${response.statusText}` };
                        }
                    } catch (parseError) {
                        console.error('❌ Error parsing orchestrator error response:', parseError);
                        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
                    }
                    
                    console.error('❌ Orchestrator error response:', errorData);
                    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
                }

                orchestratorResult = await response.json();
                console.log(`✅ PASO 2 COMPLETADO: Orchestrator iniciado exitosamente:`, orchestratorResult);
                
            } catch (orchestratorError) {
                console.error(`❌ PASO 2 FALLÓ: Error iniciando orchestrator:`, orchestratorError);
                throw new Error(`El archivo se subió correctamente, pero no se pudo iniciar el procesamiento: ${orchestratorError instanceof Error ? orchestratorError.message : 'Error desconocido'}`);
            }

            return orchestratorResult;

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('subir el archivo')) {
                    console.error('❌ Error en el paso 1 (upload):', error.message);
                    throw new Error(`❌ No se pudo subir el archivo: ${error.message}`);
                } else if (error.message.includes('procesamiento')) {
                    console.error('❌ Error en el paso 2 (orchestrator):', error.message);
                    throw new Error(`⚠️ Archivo subido, pero error iniciando procesamiento: ${error.message}`);
                } else {
                    console.error('❌ Error general en el proceso:', error.message);
                    throw error;
                }
            } else {
                console.error('❌ Error desconocido en el proceso completo:', error);
                throw new Error('❌ Error desconocido en el procesamiento del documento');
            }
        }
    }

    /**
     * Check orchestrator status
     */
    async checkOrchestratorStatus(instanceId: string): Promise<OrchestratorStatusResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/orchestrators/status/${instanceId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error checking orchestrator status:', error);
            throw error;
        }
    }
}

export const documentApiService = new DocumentApiService();
export type { DocumentUploadResponse, DocumentInfo, DocumentListResponse, DocumentAIAnalysisResponse, OrchestratorStatusResponse };
