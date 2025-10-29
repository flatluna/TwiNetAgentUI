/**
 * API service for Twin operations
 */

// En desarrollo, usar proxy de Vite (rutas relativas /api)
// En producción, usar la URL completa
const API_BASE_URL = import.meta.env.DEV 
    ? '' // Usar rutas relativas para que Vite proxy las redirija
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7011');

console.log('🔧 API_BASE_URL configured as:', API_BASE_URL || 'RELATIVE PATHS (using Vite proxy)');
console.log('🔧 Development mode:', import.meta.env.DEV);

const API_KEY = import.meta.env.VITE_API_KEY || 'B509918774DDE22A5BF94EDB4F145CB6E06F1CBCCC49D492D27FFD4AC3667A71';

// Interface for Family Data (exact match with backend FamilyData class)
export interface FamilyData {
    Id?: string;
    TwinID?: string;
    
    // Campos básicos existentes actualizados
    Parentesco: string;
    Nombre: string;
    Apellido: string;
    Email: string;
    Telefono: string;
    FechaNacimiento: string;
    
    // Nuevos campos agregados del formulario
    NombreTwin: string;
    DireccionCompleta: string;
    PaisNacimiento: string;
    Nacionalidad: string;
    Genero: string;
    Ocupacion: string;
    Intereses: string[];
    Idiomas: string[];
    
    // Campos existentes mantenidos
    NumeroCelular: string;
}

// Interface for Family Member (actualizada según nueva API)
export interface FamilyMember {
    id?: string;
    twinId: string;
    parentesco: string; // Cambiado de relationshipType
    nombre: string;     // Cambiado de firstName
    apellido?: string;  // Cambiado de lastName (ahora opcional)
    fechaNacimiento?: string; // Cambiado de dateOfBirth
    numeroCelular?: string;   // Cambiado de phoneNumber
    email?: string;
    urlFoto?: string;    // Cambiado de photoUrl
    notas?: string;      // Cambiado de notes
    createdDate?: string; // Cambiado de createdAt
    type?: string;       // Nuevo campo para tipo de documento
    
    // Nuevos campos agregados del formulario (match with FamilyData)
    telefono?: string;
    nombreTwin?: string;
    direccionCompleta?: string;
    paisNacimiento?: string;
    nacionalidad?: string;
    genero?: string;
    ocupacion?: string;
    intereses?: string[];
    idiomas?: string[];
    
    // Campos legacy para compatibilidad (deprecated)
    firstName?: string;  // @deprecated - usar 'nombre'
    lastName?: string;   // @deprecated - usar 'apellido'
    relationshipType?: string; // @deprecated - usar 'parentesco'
    dateOfBirth?: string; // @deprecated - usar 'fechaNacimiento'
    phoneNumber?: string; // @deprecated - usar 'numeroCelular'
    photoUrl?: string;   // @deprecated - usar 'urlFoto'
    notes?: string;      // @deprecated - usar 'notas'
    createdAt?: string;  // @deprecated - usar 'createdDate'
    updatedAt?: string;  // @deprecated
    
    // Campos removidos en nueva API
    address?: string;      // @deprecated - no usado en nueva API
    occupation?: string;   // @deprecated - usar 'ocupacion'
    isAlive?: boolean;     // @deprecated - no usado en nueva API
    deathDate?: string;    // @deprecated - no usado en nueva API
    emergencyContact?: boolean; // @deprecated - no usado en nueva API
}

// Interface for Resume/CV data
export interface ResumeData {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadDate: string;
    lastModified: string;
    contentType: string;
    isActive?: boolean;
    downloadUrl?: string;
}

// Enhanced interfaces for processed resume data
export interface ResumePersonalInfo {
    fullName: string;
    email: string;
    phoneNumber: string;
    currentPosition: string;
}

export interface ResumeStats {
    workExperience: number;
    education: number;
    skills: number;
    certifications: number;
    projects: number;
    awards: number;
}

export interface ResumeStatus {
    isComplete: boolean;
    hasWorkExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    hasCertifications: boolean;
}

// Enhanced Resume File interface with AI processing data
export interface ResumeFile {
    // Nuevos campos del formato GetResumesFormatted
    id: string;
    TwinID: string;
    documentType: string;
    fileName: string;
    filePath: string;
    containerName: string;
    sasUrl: string;
    fileUrl: string;
    processedAt: string;
    createdAt: string;
    success: boolean;
    
    // Información personal directa
    fullName: string;
    email: string;
    phoneNumber: string;
    address?: string;
    linkedin?: string;
    
    // Estadísticas
    totalWorkExperience: number;
    currentJobTitle: string;
    currentCompany: string;
    totalEducation: number;
    highestDegree: string;
    lastInstitution: string;
    totalSkills: number;
    skillsList: string[];
    totalCertifications: number;
    totalProjects: number;
    totalAwards: number;
    hasSalaryInfo: boolean;
    hasBenefitsInfo: boolean;
    totalAssociations: number;
    
    // Resúmenes
    summary: string;
    executiveSummary: string;
    type: string;
    
    // Datos detallados estructurados
    resumeData: {
        executive_summary: string;
        personal_information: {
            full_name: string;
            address: string;
            phone_number: string;
            email: string;
            linkedin: string;
        };
        summary: string;
        skills: string[];
        education: Array<{
            degree: string;
            institution: string;
            graduation_year: number;
            location: string;
        }>;
        work_experience: Array<{
            job_title: string;
            company: string;
            duration: string;
            responsibilities: string[];
        }>;
        salaries: any[];
        benefits: any[];
        certifications: Array<{
            title: string;
            issuing_organization: string;
            date_issued: string;
        }>;
        projects: any[];
        awards: Array<{
            title: string;
            organization: string;
            year: number;
        }>;
        professional_associations: any[];
    };
    
    // Campos legacy para compatibilidad (deprecated)
    documentId?: string;
    uploadedAt?: string;
    daysAgo?: number;
    personalInfo?: ResumePersonalInfo;
    professionalSummary?: string;
    stats?: ResumeStats;
    topSkills?: string[];
    status?: ResumeStatus;
    fullResumeData?: any;
    fileSize?: number;
    uploadTime?: string;
    lastModified?: string;
    contentType?: string;
    isActive?: boolean;
    fileExtension?: string;
    displayName?: string;
}

// Enhanced Resume List Response
export interface ResumeListResponse {
    success: boolean;
    message: string;
    twinId: string;
    totalResumes: number;
    resumes: ResumeFile[];
    activeResume?: ResumeFile;
    // Legacy field for compatibility
    totalCount?: number;
}

// Interfaces para ImageAI - Análisis de fotos familiares con IA
export interface ImageAI {
    detailsHTML?: string;  // Campo legacy
    pictureContentHTML?: string;  // Campo actual del API
    descripcionGenerica: string;
    descripcionUsuario?: string;  // Descripción del usuario
    descripcionDetallada?: string | null;
    descripcion_visual_detallada: DescripcionVisualDetallada;
    contexto_emocional: ContextoEmocional;
    contextoEmocional?: any; // Para compatibilidad con el nuevo formato
    elementos_temporales: ElementosTemporales;
    elementosTemporales?: any; // Para compatibilidad con el nuevo formato
    detalles_memorables: DetallesMemorables;
    detallesMemorables?: any; // Para compatibilidad con el nuevo formato
    id?: string;
    TwinID?: string;
    twinID?: string; // Para compatibilidad
    url?: string;
    path?: string;
    fileName?: string;
    fecha?: string;  // Fecha en formato "2010-10-25 21:04:46"
    hora?: string;   // Hora en formato "21:04:46"
    // Nuevas propiedades del API
    category?: string;
    people?: string; // Personas en la foto
    places?: string; // Ubicaciones
    etiquetas?: string; // Etiquetas
    eventType?: string;
    totalTokensDescripcionDetallada?: number;
}

export interface DescripcionVisualDetallada {
    personas: Personas;
    objetos: Objeto[];
    escenario: Escenario;
    colores: Colores;
}

export interface Personas {
    cantidad?: number;
    descripcion?: string;
    edades_aproximadas?: string[];
    genero?: string[];
    vestimenta?: string[];
    expresiones?: string[];
    posiciones?: string[];
}

export interface Objeto {
    nombre: string;
    descripcion: string;
    ubicacion?: string;
    estado?: string;
}

export interface Escenario {
    ubicacion: string;
    tipo_espacio: string;
    iluminacion: string;
    momento_dia?: string;
    clima?: string;
    ambiente: string;
}

export interface Colores {
    dominantes: string[];
    secundarios?: string[];
    paleta_general: string;
}

export interface ContextoEmocional {
    ambiente_general: string;
    emociones_detectadas: string[];
    energia_nivel: string;
    formalidad: string;
}

export interface ElementosTemporales {
    epoca_estimada?: string;
    indicadores_temporales: string[];
    estacion_probable?: string;
    momento_dia?: string;
}

export interface DetallesMemorables {
    elementos_unicos: string[];
    aspectos_destacados: string[];
    importancia_estimada: string;
    valor_sentimental: string;
}

// Interfaces para búsqueda semántica de fotos familiares (Nueva estructura del backend)
export interface PictureFoundResponse {
    pictureId: string;
    filename: string;
    path: string;
    descripcionGenerica: string;
    pictureContent: string;
    contextoRecordatorio: string;
    totalTokens: number;
    searchScore: number;
    createdAt: string;
    highlights: string[];
}

export interface SearchSummaryResponse {
    totalFound: number;
    searchQuery: string;
    executionTime: string;
}

export interface FotosAiSearchResponse {
    htmlResponse: string;
    picturesFound: PictureFoundResponse[];
    searchSummary: SearchSummaryResponse;
}

export interface FamilyPhotosSearchResult {
    success: boolean;
    query: string;
    aiResponse: FotosAiSearchResponse;
    twinId: string;
    searchedAt: string;
}

// Interface legacy (mantener para compatibilidad)
export interface PicturesFamilySearchResultItem {
    id: string;
    twinId: string;
    fileName: string;
    url: string;
    description?: string;
    category?: string;
    tags?: string;
    date_taken?: string;
    location?: string;
    people_in_photo?: string;
    searchScore: number;
    searchType: string;
    relevanceReason?: string;
}

export interface TwinProfileData {
    twinId?: string; // Add twinId field for backend compatibility
    subscriptionId?: string; // Subscription ID field for display
    twinName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    birthCountry: string;
    birthCity: string;
    nationality: string;
    gender: string;
    occupation: string;
    interests: string[];
    languages: string[];
    countryId: string;
    // Profile photo URL
    profilePhoto?: string;
    // Campos extendidos opcionales
    middleName?: string;
    nickname?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    maritalStatus?: string;
    personalBio?: string;
    
    // Información de Emergencia
    emergencyContact?: string;
    emergencyPhone?: string;
    
    // Información Médica Básica
    bloodType?: string;
    height?: string;
    weight?: string;
    
    // Documentos de Identidad
    documentType?: string;
    documentNumber?: string;
    passportNumber?: string;
    socialSecurityNumber?: string;
    
    // Redes Sociales y Web
    website?: string;
    linkedIn?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    
    // Información Profesional Adicional
    company?: string;
}

export interface TwinProfileResponse extends TwinProfileData {
    id: string;
    twinName: string;
    createdAt: string;
    lastModified: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Contact interfaces - Updated to match backend C# ContactData class
export interface ContactData {
    Id?: string;
    TwinID?: string;
    Nombre: string;
    Apellido: string;
    Relacion: 'familia' | 'amigo' | 'colega' | 'conocido' | 'profesional' | 'otro';
    Apodo?: string;
    TelefonoMovil?: string;
    TelefonoTrabajo?: string;
    TelefonoCasa?: string;
    Email?: string;
    Direccion?: string;
    Empresa?: string;
    Cargo?: string;
    Cumpleanos?: string;
    Notas?: string;
    CreatedDate?: string;
    Type?: string;
}

export interface ContactResponse extends ContactData {
    Id: string;
    TwinID: string;
    CreatedDate: string;
    Type: string;
}

// Frontend Contact interface with English field names
export interface Contact {
    contact_id: string;
    first_name: string;
    last_name: string;
    nickname?: string;
    phone_mobile?: string;
    phone_work?: string;
    phone_home?: string;
    email?: string;
    address?: string;
    company?: string;
    position?: string;
    relationship: 'familia' | 'amigo' | 'colega' | 'conocido' | 'profesional' | 'otro';
    birthday?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    type?: string;
}

// Education interfaces - Backend C# EducationData class
export interface EducationData {
    Id?: string;
    TwinID?: string;
    Institucion: string;
    TipoEducacion: 'primaria' | 'secundaria' | 'preparatoria' | 'universidad' | 'posgrado' | 'certificacion' | 'diploma' | 'curso' | 'otro';
    TituloObtenido?: string;
    CampoEstudio?: string;
    FechaInicio: string;
    FechaFin?: string;
    EnProgreso: boolean;
    Pais?: string;
    Descripcion?: string;
    LogrosDestacados?: string;
    Promedio?: string;
    Creditos?: number;
    CreatedDate?: string;
    Type?: string;
}

export interface EducationResponse extends EducationData {
    Id: string;
    TwinID: string;
    CreatedDate: string;
    Type: string;
}

// Frontend Education interface with English field names
export interface EducationDocument {
    documentId: string;
    fileName: string;
    filePath: string;
    containerName: string;
    processedAt: string;
    success: boolean;
    errorMessage?: string;
    textContent?: string;
    htmlContent?: string;
    documentType: string;
    sasUrl?: string; // SAS URL for secure access
    sourceUri?: string; // Alternative source URI
}

export interface Education {
    id?: string; // Backend returns this field
    education_id?: string; // Legacy field name
    institution: string;
    education_type: 'primaria' | 'secundaria' | 'preparatoria' | 'universidad' | 'posgrado' | 'certificacion' | 'diploma' | 'curso' | 'otro';
    degree_obtained?: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    in_progress: boolean;
    country?: string;
    description?: string;
    achievements?: string;
    gpa?: string;
    credits?: number;
    created_at?: string;
    updated_at?: string;
    type?: string;
    documents?: EducationDocument[]; // Array of uploaded documents with proper typing
}

class TwinApiService {
    /**
     * Helper function to determine if a string is a UUID/GUID
     */
    private isUUID(str: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    }

    /**
     * Smart Twin lookup - automatically determines whether to use ID or name endpoint
     */
    async getTwinByIdentifier(identifier: string): Promise<ApiResponse<TwinProfileResponse>> {
        if (this.isUUID(identifier)) {
            console.log('🔍 Identifier is UUID, using getTwinById:', identifier);
            return this.getTwinById(identifier);
        } else {
            console.log('🔍 Identifier is name, using getTwinByName:', identifier);
            return this.getTwinByName(identifier);
        }
    }

    private async makeRequest<T>(
        endpoint: string, 
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const config: RequestInit = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY,
                    ...options.headers,
                },
                ...options,
            };

            console.log(`🔄 Making API request to: ${url}`);
            console.log(`🔧 API_BASE_URL: "${API_BASE_URL}"`);
            console.log(`🔧 Full endpoint: "${endpoint}"`);
            console.log(`🔧 HTTP Method: ${config.method || 'GET'}`);
            console.log('📋 Request config:', config);

            const response = await fetch(url, config);
            
            console.log(`📡 Response status: ${response.status} ${response.statusText}`);
            console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error (${response.status}):`, errorText);
                
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                return {
                    success: false,
                    error: errorMessage
                };
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            
            // Handle backend responses that wrap data in {success: true, profile: {...}} format
            let responseData = data;
            if (data && data.success && data.profile) {
                responseData = data.profile;
                console.log('🔧 Extracted profile data:', responseData);
            }
            // Handle Twin profile responses - ensure required fields are present
            else if (data && (data.firstName || data.lastName || data.email || data.twinName)) {
                responseData = this.mapTwinProfileFromBackend(data);
                console.log('🔧 Mapped Twin profile data:', responseData);
            }
            // Handle contacts endpoint that returns {contacts: [...], count: number}
            else if (data && data.contacts && Array.isArray(data.contacts)) {
                // Map Spanish field names to English for contacts
                responseData = data.contacts.map((contact: any) => this.mapContactFromBackend(contact));
                console.log('🔧 Extracted and mapped contacts data:', responseData);
            }
            // Handle education endpoint that returns {educationRecords: [...], count: number}
            else if (data && data.educationRecords && Array.isArray(data.educationRecords)) {
                // Map education records from backend
                responseData = data.educationRecords.map((education: any) => this.mapEducationFromBackend(education));
                console.log('🔧 Extracted and mapped education records:', responseData);
            }
            // Handle single contact response (for create/update operations)
            else if (data && (data.nombre || data.apellido || data.Nombre || data.Apellido)) {
                responseData = this.mapContactFromBackend(data);
                console.log('🔧 Mapped single contact data:', responseData);
            }
            // Handle single education response (for create/update operations)
            else if (data && (data.institucion || data.Institucion || data.Institution || 
                             data.tipoEducacion || data.TipoEducacion || data.EducationType ||
                             data.Type === 'education' || data.type === 'education')) {
                responseData = this.mapEducationFromBackend(data);
                console.log('🔧 Mapped single education data:', responseData);
            }
            // Handle array of contacts or education directly
            else if (Array.isArray(data)) {
                responseData = data.map((item: any) => {
                    // Check if it looks like a contact (Spanish or English fields)
                    if (item.nombre || item.apellido || item.Nombre || item.Apellido) {
                        return this.mapContactFromBackend(item);
                    }
                    // Check if it looks like education (Spanish, English, or PascalCase fields)
                    else if (item.institucion || item.Institucion || item.Institution || 
                             item.tipoEducacion || item.TipoEducacion || item.EducationType ||
                             item.Type === 'education' || item.type === 'education') {
                        return this.mapEducationFromBackend(item);
                    }
                    return item;
                });
                console.log('🔧 Mapped array of items:', responseData);
            }
            
            return {
                success: true,
                data: responseData
            };
        } catch (error) {
            console.error('❌ Network/Request Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Helper method to map Twin profile data from backend
     */
    private mapTwinProfileFromBackend(backendTwin: any): TwinProfileResponse {
        return {
            ...backendTwin,
            id: backendTwin.id || backendTwin.twinId || '',
            twinName: backendTwin.twinName || backendTwin.twin_name || '',
            createdAt: backendTwin.createdAt || backendTwin.created_at || new Date().toISOString(),
            lastModified: backendTwin.lastModified || backendTwin.last_modified || new Date().toISOString()
        };
    }

    /**
     * Helper method to map education data from backend (C# EducationData class)
     * Maps Spanish field names to English field names expected by frontend
     */
    private mapEducationFromBackend(backendEducation: any): Education {
        // Map backend field names to frontend English field names
        // Based on the ToDict() method from .NET backend
        const educationId = backendEducation.id || backendEducation.Id || '';
        
        const mappedEducation: Education = {
            id: educationId, // Primary ID field returned by backend (lowercase 'id' from ToDict)
            education_id: educationId, // Legacy field for compatibility
            institution: backendEducation.institution || backendEducation.Institution || '', // lowercase from ToDict
            education_type: (backendEducation.education_type || backendEducation.EducationType || 'otro') as any, // underscore from ToDict
            degree_obtained: backendEducation.degree_obtained || backendEducation.DegreeObtained || '', // underscore from ToDict
            field_of_study: backendEducation.field_of_study || backendEducation.FieldOfStudy || '', // underscore from ToDict
            start_date: backendEducation.start_date || backendEducation.StartDate || '', // underscore from ToDict
            end_date: backendEducation.end_date || backendEducation.EndDate || '', // underscore from ToDict
            in_progress: backendEducation.in_progress !== undefined ? backendEducation.in_progress : (backendEducation.InProgress !== undefined ? backendEducation.InProgress : false), // underscore from ToDict
            country: backendEducation.country || backendEducation.Country || '', // lowercase from ToDict
            description: backendEducation.description || backendEducation.Description || '', // lowercase from ToDict
            achievements: backendEducation.achievements || backendEducation.Achievements || '', // lowercase from ToDict
            gpa: backendEducation.gpa || backendEducation.Gpa || '', // lowercase from ToDict
            credits: backendEducation.credits || backendEducation.Credits || 0, // lowercase from ToDict
            created_at: backendEducation.createdDate || backendEducation.CreatedDate || new Date().toISOString(), // createdDate from ToDict
            updated_at: backendEducation.UpdatedDate || backendEducation.updatedDate || '',
            type: backendEducation.type || backendEducation.Type || 'education', // lowercase from ToDict
            documents: (backendEducation.documents || backendEducation.Documents || []).map((doc: any): EducationDocument => {
                const sasUrl = doc.sasUrl || doc.SasUrl || doc.SASURL || doc.sas_url || '';
                console.log('🔗 Document URL mapping:', {
                    fileName: doc.fileName || doc.FileName || '',
                    original: doc,
                    sasUrl: doc.sasUrl,
                    SasUrl: doc.SasUrl,
                    SASURL: doc.SASURL,
                    sas_url: doc.sas_url,
                    mapped: sasUrl
                });
                
                return {
                    documentId: doc.documentId || doc.DocumentId || '',
                    fileName: doc.fileName || doc.FileName || '',
                    filePath: doc.filePath || doc.FilePath || '',
                    containerName: doc.containerName || doc.ContainerName || '',
                    processedAt: doc.processedAt || doc.ProcessedAt || '',
                    success: doc.success !== undefined ? doc.success : (doc.Success !== undefined ? doc.Success : true),
                    errorMessage: doc.errorMessage || doc.ErrorMessage || '',
                    textContent: doc.textContent || doc.TextContent || '',
                    htmlContent: doc.htmlContent || doc.HtmlContent || '',
                    documentType: doc.documentType || doc.DocumentType || 'Education',
                    sasUrl: sasUrl,
                    sourceUri: doc.sourceUri || doc.SourceUri || doc.source_uri || ''
                };
            }) // Include documents array with proper mapping
        };

        console.log('🎓 Mapped education from backend (.NET ToDict format):', {
            input: backendEducation,
            output: mappedEducation,
            documentsInfo: {
                backendDocuments: backendEducation.documents,
                backendDocumentsPascal: backendEducation.Documents,
                finalDocuments: mappedEducation.documents,
                documentsLength: mappedEducation.documents?.length,
                // Let's see all possible document fields
                allBackendKeys: Object.keys(backendEducation),
                rawDocumentsArray: backendEducation.Documents || backendEducation.documents,
                firstDocumentStructure: (backendEducation.Documents || backendEducation.documents)?.[0],
                mappedDocumentsPreview: mappedEducation.documents?.map(doc => ({
                    id: doc.documentId,
                    name: doc.fileName,
                    type: doc.documentType
                }))
            },
            fields: {
                id: `${backendEducation.id} → ${mappedEducation.id}`,
                institution: `${backendEducation.institution} → ${mappedEducation.institution}`,
                education_type: `${backendEducation.education_type} → ${mappedEducation.education_type}`,
                country: `${backendEducation.country} → ${mappedEducation.country}`,
                start_date: `${backendEducation.start_date} → ${mappedEducation.start_date}`
            }
        });
        return mappedEducation;
    }

    /**
     * Helper method to map contact data from backend (C# ContactData class)
     * Maps Spanish field names to English field names expected by frontend
     */
    private mapContactFromBackend(backendContact: any): Contact {
        // Map backend Spanish field names to frontend English field names
        // Handle both capitalized and lowercase versions
        const mappedContact: Contact = {
            contact_id: backendContact.Id || backendContact.id || '',
            first_name: backendContact.Nombre || backendContact.nombre || '',
            last_name: backendContact.Apellido || backendContact.apellido || '',
            nickname: backendContact.Apodo || backendContact.apodo || '',
            phone_mobile: backendContact.TelefonoMovil || backendContact.telefonoMovil || '',
            phone_work: backendContact.TelefonoTrabajo || backendContact.telefonoTrabajo || '',
            phone_home: backendContact.TelefonoCasa || backendContact.telefonoCasa || '',
            email: backendContact.Email || backendContact.email || '',
            address: backendContact.Direccion || backendContact.direccion || '',
            company: backendContact.Empresa || backendContact.empresa || '',
            position: backendContact.Cargo || backendContact.cargo || '',
            relationship: (backendContact.Relacion || backendContact.relacion || 'otro') as any,
            birthday: backendContact.Cumpleanos || backendContact.cumpleanos || '',
            notes: backendContact.Notas || backendContact.notas || '',
            created_at: backendContact.CreatedDate || backendContact.createdDate || new Date().toISOString(),
            updated_at: backendContact.UpdatedDate || backendContact.updatedDate || '',
            type: backendContact.Type || backendContact.type || 'contact'
        };

        console.log('🔄 Mapped contact from backend:', {
            input: backendContact,
            output: mappedContact,
            fields: {
                id: `${backendContact.Id || backendContact.id} → ${mappedContact.contact_id}`,
                name: `${backendContact.Nombre || backendContact.nombre} → ${mappedContact.first_name}`,
                lastName: `${backendContact.Apellido || backendContact.apellido} → ${mappedContact.last_name}`
            }
        });
        return mappedContact;
    }

    /**
     * Create a new Twin profile
     * POST /api/twin-profiles
     */
    async createTwin(twinData: TwinProfileData): Promise<ApiResponse<TwinProfileResponse>> {
        console.log('🚀 Creating twin with data:', twinData);
        
        return this.makeRequest<TwinProfileResponse>('/api/twin-profiles', {
            method: 'POST',
            body: JSON.stringify(twinData),
        });
    }

    /**
     * Get a Twin profile by twin name
     * GET /api/twin-profiles/{twin_name}
     */
    async getTwinByName(twinName: string): Promise<ApiResponse<TwinProfileResponse>> {
        return this.makeRequest<TwinProfileResponse>(`/api/twin-profiles/${encodeURIComponent(twinName)}`);
    }

    /**
     * Get a Twin profile by ID
     * GET /api/twin-profiles/id/{twin_id}
     */
    async getTwinById(twinId: string): Promise<ApiResponse<TwinProfileResponse>> {
        return this.makeRequest<TwinProfileResponse>(`/api/twin-profiles/id/${encodeURIComponent(twinId)}`);
    }

    /**
     * Get Twin profile for modal display - uses the GetTwinProfilesByTwinId endpoint
     * GET /api/twin-profiles/twinid/{twinId}
     * Returns the complete backend response with profiles as a single object
     */
    async getTwinProfileForModal(twinId: string): Promise<ApiResponse<{
        success: boolean;
        profiles: TwinProfileResponse;
        totalCount: number;
        twinId: string;
        message: string;
    }>> {
        console.log('🔍 Getting twin profile for modal using GetTwinProfilesByTwinId endpoint, TwinId:', twinId);
        return this.makeRequest<{
            success: boolean;
            profiles: TwinProfileResponse;
            totalCount: number;
            twinId: string;
            message: string;
        }>(`/api/twin-profiles/twinid/${encodeURIComponent(twinId)}`);
    }

    /**
     * Update a Twin profile by ID
     * PUT /api/twin-profiles/id/{twin_id}
     */
    async updateTwinById(
        twinId: string, 
        updateData: Partial<TwinProfileData>
    ): Promise<ApiResponse<TwinProfileResponse>> {
        return this.makeRequest<TwinProfileResponse>(`/api/twin-profiles/id/${encodeURIComponent(twinId)}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    /**
     * Update a Twin profile by name
     * PUT /api/twin-profiles/{twin_name}
     */
    async updateTwinByName(
        twinName: string, 
        updateData: Partial<TwinProfileData>
    ): Promise<ApiResponse<TwinProfileResponse>> {
        return this.makeRequest<TwinProfileResponse>(`/api/twin-profiles/${encodeURIComponent(twinName)}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    /**
     * Delete a Twin profile by ID
     * DELETE /api/twin-profiles/id/{twin_id}
     */
    async deleteTwinById(twinId: string): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(`/api/twin-profiles/id/${encodeURIComponent(twinId)}`, {
            method: 'DELETE',
        });
    }

    /**
     * Delete a Twin profile by name
     * DELETE /api/twin-profiles/{twin_name}
     */
    async deleteTwinByName(twinName: string): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(`/api/twin-profiles/${encodeURIComponent(twinName)}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get Twin profiles by specific Twin ID (for authenticated user)
     * GET /api/twin-profiles/twinid/{twinId}
     * Note: Backend returns profiles as a single object (profiles[0]), not an array
     */
    async getTwinProfilesByTwinId(twinId: string): Promise<ApiResponse<{
        success: boolean;
        profiles: TwinProfileResponse;
        totalCount: number;
        twinId: string;
        message: string;
    }>> {
        console.log('🔍 Getting twin profiles for TwinId:', twinId);
        return this.makeRequest<{
            success: boolean;
            profiles: TwinProfileResponse;
            totalCount: number;
            twinId: string;
            message: string;
        }>(`/api/twin-profiles/twinid/${encodeURIComponent(twinId)}`);
    }

    /**
     * Get all Twin profiles
     * GET /api/twin-profiles/all
     */
    async getAllTwins(): Promise<ApiResponse<TwinProfileResponse[]>> {
        return this.makeRequest<TwinProfileResponse[]>('/api/twin-profiles/all');
    }

    // Legacy methods for backward compatibility - DEPRECATED
    /**
     * @deprecated Use updateTwinById or updateTwinByName instead
     */
    async updateTwin(
        twinId: string, 
        updateData: Partial<TwinProfileData>
    ): Promise<ApiResponse<TwinProfileResponse>> {
        return this.updateTwinById(twinId, updateData);
    }

    /**
     * @deprecated Use deleteTwinById or deleteTwinByName instead
     */
    async deleteTwin(twinId: string): Promise<ApiResponse<void>> {
        return this.deleteTwinById(twinId);
    }

    /**
     * @deprecated Use getTwinById instead
     */
    async getTwin(twinId: string): Promise<ApiResponse<TwinProfileResponse>> {
        return this.getTwinById(twinId);
    }

    /**
     * Upload a profile photo for a twin
     */
    async uploadTwinPhoto(
        twinId: string, 
        photoBase64: string, 
        fileExtension: string = "jpg"
    ): Promise<ApiResponse<{
        success: boolean;
        message: string;
        photo_url: string;
        file_path: string;
        filename: string;
        size_bytes: number;
    }>> {
        // Remove data URL prefix if present (data:image/jpeg;base64,)
        const cleanBase64 = photoBase64.includes(',') 
            ? photoBase64.split(',')[1] 
            : photoBase64;
            
        console.log('📸 Enviando foto al backend:');
        console.log('  - Twin ID:', twinId);
        console.log('  - File Extension:', fileExtension);
        console.log('  - Base64 length:', cleanBase64.length);
        console.log('  - First 50 chars of base64:', cleanBase64.substring(0, 50));
        
        return this.makeRequest(`/api/twins/${twinId}/upload-photo`, {
            method: 'POST',
            body: JSON.stringify({
                imageData: cleanBase64,  // Changed from photo_base64 to imageData to match backend
                fileName: `profile_photo.${fileExtension}`  // Added fileName to match backend expectation
            }),
        });
    }

    /**
     * Get the current profile photo URL for a twin
     */
    async getTwinPhotoUrl(twinId: string): Promise<ApiResponse<{
        success: boolean;
        photo_url: string | null;
        source?: string;
        message?: string;
    }>> {
        return this.makeRequest(`/api/twins/${twinId}/photo-url`, {
            method: 'GET',
        });
    }

    /**
     * Get the profile photo proxy URL for a twin (served directly from backend)
     */
    getTwinPhotoProxyUrl(twinId: string): string {
        return `${API_BASE_URL}/api/twins/${twinId}/photo-proxy`;
    }

    /**
     * Get direct blob storage URL for profile picture (for debugging)
     */
    getDirectBlobUrl(twinId: string): string {
        return `https://twinnetstorage.blob.core.windows.net/${twinId}/profile/picture`;
    }

    /**
     * Get or create Twin from MSAL user claims
     * This function checks if a Twin exists for the authenticated user,
     * and creates one if it doesn't exist using the token claims
     */
    async getOrCreateTwinFromClaims(msalUser: any): Promise<ApiResponse<TwinProfileResponse>> {
        try {
            // Extract data from MSAL user claims
            const claims = msalUser.idTokenClaims as any;
            const localAccountId = msalUser.localAccountId;
            
            console.log('🔍 Raw MSAL user object:', msalUser);
            console.log('📋 Available claims:', claims);
            console.log('🆔 Local Account ID:', localAccountId);
            
            // Extract claims for Twin creation with better validation
            const givenName = claims.given_name || claims.name || '';
            const familyName = claims.family_name || '';
            
            // Try multiple ways to get email
            let email = '';
            if (claims.email) {
                email = claims.email;
            } else if (claims.emails && Array.isArray(claims.emails) && claims.emails.length > 0) {
                email = claims.emails[0];
            } else if (claims.preferred_username) {
                email = claims.preferred_username;
            } else if (claims.unique_name) {
                email = claims.unique_name;
            } else if (msalUser.username) {
                email = msalUser.username;
            }
            
            const country = claims.country || claims.ctry || 'ES'; // Default to Spain if not provided
            
            console.log('🆔 Using localAccountId as twinId:', localAccountId);
            console.log('📧 Extracted email:', email);
            console.log('👤 Extracted names:', { givenName, familyName });
            console.log('🌍 Extracted country:', country);
            
            // Validate that we have essential data
            if (!email || email.trim() === '') {
                console.error('❌ No valid email found in user claims');
                return {
                    success: false,
                    error: 'No valid email found in user claims. Cannot create Twin profile.'
                };
            }
            
            // Use localAccountId as twinId for lookup (since it's a UUID/GUID)
            const twinId = localAccountId;
            
            console.log('🔍 Checking if Twin exists for twinId:', twinId);
            
            // Since localAccountId is a UUID/GUID, use getTwinById directly
            const existingTwin = await this.getTwinById(twinId);
            
            if (existingTwin.success && existingTwin.data) {
                console.log('✅ Twin already exists:', existingTwin.data);
                return existingTwin;
            }
            
            console.log('🚀 Twin does not exist, creating new Twin...');
            
            // Validate we have minimum required data
            if (!givenName && !familyName) {
                console.log('⚠️ No name information available, using email as fallback');
            }
            
            // Create Twin data from claims with proper validation
            const twinData: TwinProfileData = {
                twinId: localAccountId, // Use localAccountId as twinId for backend
                twinName: localAccountId, // Use localAccountId as twin name for consistency
                firstName: givenName || 'Usuario', // Fallback if no name
                lastName: familyName || 'Twin', // Fallback if no last name
                email: email, // Already validated above
                phone: '', // Will need to be filled later
                address: '', // Will need to be filled later
                dateOfBirth: '', // Will need to be filled later
                birthCountry: country,
                birthCity: '', // Will need to be filled later
                nationality: country,
                gender: '', // Will need to be filled later
                occupation: '', // Will need to be filled later
                interests: [],
                languages: ['Español'], // Default language
                countryId: country
            };
            
            console.log('🚀 Creating Twin with validated data:', twinData);
            
            // Create the Twin
            const createResult = await this.createTwin(twinData);
            
            if (createResult.success) {
                console.log('✅ Twin created successfully:', createResult.data);
            } else {
                console.error('❌ Failed to create Twin:', createResult.error);
            }
            
            return createResult;
            
        } catch (error) {
            console.error('❌ Error in getOrCreateTwinFromClaims:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Upload a family photo for a twin using JSON with base64 data (updated API)
     */
    async uploadFamilyPhotoWithMetadata(
        twinId: string,
        file: File,
        metadata: {
            description?: string;
            date_taken: string;
            time_taken?: string; // Added for TimeTaken field
            location?: string;
            country?: string;
            place?: string;
            people_in_photo?: string;
            category: string;
            tags?: string;
            event_type?: string; // Added event_type for folder structure
        }
    ): Promise<ApiResponse<{
        success: boolean;
        message: string;
        photo_url: string;
        photo_id: string;
        file_path?: string;
        filename?: string;
        size_bytes?: number;
    }>> {
        console.log('📷 Uploading family photo with new UploadFamilyPhoto endpoint:');
        console.log('  - Twin ID:', twinId);
        console.log('  - File:', file.name, file.size, 'bytes');
        console.log('  - Metadata received:', metadata);

        try {
            // Create FormData for multipart/form-data matching PhotoFormData class structure
            const formData = new FormData();
            
            // Add the actual file
            formData.append('photo', file, file.name);
            
            // Map metadata to PhotoFormData structure exactly as backend expects
            formData.append('FileName', file.name);
            formData.append('TimeTaken', metadata.time_taken || ''); // Just the time portion
            formData.append('Path', ''); // Backend will handle the path
            formData.append('Description', metadata.description || '');
            formData.append('DateTaken', metadata.date_taken); // Full date and time
            formData.append('Location', metadata.location || '');
            formData.append('Country', metadata.country || '');
            formData.append('Place', metadata.place || '');
            formData.append('PeopleInPhoto', metadata.people_in_photo || '');
            formData.append('Tags', metadata.tags || '');
            
            // Convert category to proper enum value (capitalize first letter)
            const categoryValue = metadata.category || 'familia';
            const capitalizedCategory = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);
            formData.append('Category', capitalizedCategory); // Use enum value: Familia, Eventos, etc.
            
            formData.append('EventType', metadata.event_type || '');
            
            // Generate familyId - we'll use a default value or timestamp
            const familyId = 'default'; // O podrías usar Date.now().toString() si necesitas único
            
            console.log('� FormData fields being sent:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  - ${key}: [File] ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`  - ${key}: ${value}`);
                }
            }

            // Use the new endpoint: UploadFamilyPhoto
            // POST /api/twins/{twinId}/family/{familyId}/upload-photo
            const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/family/${familyId}/upload-photo`, {
                method: 'POST',
                body: formData,
                // NO establecer Content-Type header - FormData lo hace automáticamente con boundary
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    if (errorText) {
                        errorMessage = errorText;
                    }
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Photo uploaded successfully with UploadFamilyPhoto:', data);
            
            return {
                success: true,
                data: data,
                error: undefined
            };
        } catch (error) {
            console.error('❌ Error uploading photo with UploadFamilyPhoto:', error);
            return {
                success: false,
                data: undefined,
                error: error instanceof Error ? error.message : 'Error desconocido al subir la foto'
            };
        }
    }

    /**
     * Upload a family photo for a twin (legacy method using Base64)
     * @deprecated Use uploadFamilyPhotoWithMetadata instead
     */
    async uploadFamilyPhoto(
        twinId: string,
        photoBase64: string,
        metadata: {
            title: string;
            description?: string;
            date: string;
            location?: string;
            people?: string[];
            tags?: string[];
            category: string;
        },
        fileExtension: string = "jpg"
    ): Promise<ApiResponse<{
        success: boolean;
        message: string;
        photo_url: string;
        file_path: string;
        filename: string;
        size_bytes: number;
        photo_id: string;
    }>> {
        // Remove data URL prefix if present (data:image/jpeg;base64,)
        const cleanBase64 = photoBase64.includes(',') 
            ? photoBase64.split(',')[1] 
            : photoBase64;
            
        console.log('📷 Enviando foto familiar al backend (legacy):');
        console.log('  - Twin ID:', twinId);
        console.log('  - Metadata:', metadata);
        console.log('  - File Extension:', fileExtension);
        console.log('  - Base64 length:', cleanBase64.length);
        
        return this.makeRequest(`/api/twins/${twinId}/upload-family-photo`, {
            method: 'POST',
            body: JSON.stringify({
                imageData: cleanBase64,
                fileName: `family_photo_${Date.now()}.${fileExtension}`,
                metadata: metadata
            }),
        });
    }

    /**
     * Get all family photos for a twin (new API)
     */
    async getPhotosForTwin(twinId: string): Promise<ApiResponse<{
        success: boolean;
        photos: Array<{
            photo_id: string;
            photo_url: string;
            description?: string;
            date_taken: string;
            location?: string;
            people_in_photo?: string;
            category: string;
            tags?: string;
            uploaded_at: string;
            file_size: number;
            filename?: string;
        }>;
        total_count: number;
    }>> {
        return this.makeRequest(`/api/twins/${twinId}/photos`, {
            method: 'GET'
        });
    }

    /**
     * Get all family photos for a twin (updated to match backend response)
     */
    async getFamilyPhotos(twinId: string): Promise<ApiResponse<{
        success: boolean;
        twinId: string;
        photos: Array<{
            id: string;
            twinID: string;
            fileName: string;
            url: string; // El backend devuelve 'url', no 'photoUrl'
            descripcionGenerica?: string;
            fecha?: string;
            hora?: string;
            location?: string;
            country?: string;
            place?: string;
            peopleInPhoto?: string;
            category?: string;
            tags?: string;
            fileSize?: number;
            // Campos legacy para compatibilidad
            description?: string;
            dateTaken?: string;
            filePath?: string;
            mimeType?: string;
            uploadDate?: string;
            type?: string;
            photoUrl?: string;
        }>;
        count: number;
        message: string;
        retrievedAt: string;
    }>> {
        return this.makeRequest(`/api/twins/${twinId}/family-photos`, {
            method: 'GET'
        });
    }

    /**
     * Delete a family photo
     */
    async deleteFamilyPhoto(twinId: string, photoId: string): Promise<ApiResponse<{
        success: boolean;
        message: string;
    }>> {
        console.log(`🗑️ Deleting family photo: twinId=${twinId}, photoId=${photoId}`);
        console.log(`🔗 Calling endpoint: delete /api/twins/${twinId}/family-photos/${photoId}`);
        console.log(`🎯 This should match Azure Function route: twins/{twinId}/family-photos/{photoId}`);
        
        const result = await this.makeRequest<{
            success: boolean;
            message: string;
        }>(`/api/twins/${twinId}/family-photos/${photoId}`, {
            method: 'delete'  // Lowercase to match Azure Function HttpTrigger exactly
        });
        
        console.log('🗑️ Delete API response:', result);
        return result;
    }

    /**
     * Update family photo metadata
     */
    async updateFamilyPhoto(twinId: string, photoId: string, metadata: {
        description?: string;
        date_taken?: string;
        location?: string;
        country?: string;
        place?: string;
        people_in_photo?: string;
        category?: string;
        tags?: string;
        event_type?: string;
        // CAMPOS ADICIONALES para completar la información
        filename?: string;
        file_size?: number;
        uploaded_at?: string;
        photo_url?: string;
        photo_id?: string;
    }): Promise<ApiResponse<{
        success: boolean;
        message: string;
        photo: any;
    }>> {
        console.log('🔄 Updating family photo:', photoId, 'with complete metadata:', metadata);
        
        return this.makeRequest(`/api/twins/${twinId}/family-photos/${photoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata)
        });
    }

    /**
     * Get family photo proxy URL for direct serving from backend
     */
    getFamilyPhotoProxyUrl(twinId: string, photoId: string): string {
        return `${API_BASE_URL}/api/twins/${twinId}/family-photos/${photoId}/image`;
    }

    // ===========================================
    // CONTACT MANAGEMENT METHODS
    // ===========================================

    /**
     * Get all contacts for a twin
     */
    async getContacts(twinId: string): Promise<ApiResponse<Contact[]>> {
        return this.makeRequest<Contact[]>(`/api/twins/${twinId}/contacts`);
    }

    /**
     * Create a new contact for a twin
     */
    async createContact(twinId: string, contactData: ContactData): Promise<ApiResponse<Contact>> {
        // Use the new structure directly (fields already match C# backend)
        const backendData = {
            TwinID: twinId,
            Nombre: contactData.Nombre,
            Apellido: contactData.Apellido,
            Apodo: contactData.Apodo || '',
            TelefonoMovil: contactData.TelefonoMovil || '',
            TelefonoTrabajo: contactData.TelefonoTrabajo || '',
            TelefonoCasa: contactData.TelefonoCasa || '',
            Email: contactData.Email || '',
            Direccion: contactData.Direccion || '',
            Empresa: contactData.Empresa || '',
            Cargo: contactData.Cargo || '',
            Relacion: contactData.Relacion,
            Cumpleanos: contactData.Cumpleanos || '',
            Notas: contactData.Notas || '',
            Type: contactData.Type || 'contact'
        };

        return this.makeRequest<Contact>(`/api/twins/${twinId}/contacts`, {
            method: 'POST',
            body: JSON.stringify(backendData)
        });
    }

    /**
     * Update an existing contact
     */
    async updateContact(twinId: string, contactId: string, contactData: ContactData): Promise<ApiResponse<Contact>> {
        // Use the new structure directly (fields already match C# backend)
        const backendData = {
            Id: contactId,
            TwinID: twinId,
            Nombre: contactData.Nombre,
            Apellido: contactData.Apellido,
            Apodo: contactData.Apodo || '',
            TelefonoMovil: contactData.TelefonoMovil || '',
            TelefonoTrabajo: contactData.TelefonoTrabajo || '',
            TelefonoCasa: contactData.TelefonoCasa || '',
            Email: contactData.Email || '',
            Direccion: contactData.Direccion || '',
            Empresa: contactData.Empresa || '',
            Cargo: contactData.Cargo || '',
            Relacion: contactData.Relacion,
            Cumpleanos: contactData.Cumpleanos || '',
            Notas: contactData.Notas || '',
            Type: contactData.Type || 'contact'
        };

        return this.makeRequest<Contact>(`/api/twins/${twinId}/contacts/${contactId}`, {
            method: 'PUT',
            body: JSON.stringify(backendData)
        });
    }

    /**
     * Delete a contact
     */
    async deleteContact(twinId: string, contactId: string): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(`/api/twins/${twinId}/contacts/${contactId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get a specific contact by ID
     */
    async getContactById(twinId: string, contactId: string): Promise<ApiResponse<Contact>> {
        return this.makeRequest<Contact>(`/api/twins/${twinId}/contacts/${contactId}`);
    }

    /**
     * Search contacts by query (name, email, company, etc.)
     */
    async searchContacts(twinId: string, query: string, relationship?: string): Promise<ApiResponse<Contact[]>> {
        const params = new URLSearchParams();
        params.append('q', query);
        if (relationship && relationship !== 'todos') {
            params.append('relationship', relationship);
        }
        
        return this.makeRequest<Contact[]>(`/api/twins/${twinId}/contacts/search?${params.toString()}`);
    }

    /**
     * Get contacts by relationship type
     */
    async getContactsByRelationship(twinId: string, relationship: string): Promise<ApiResponse<Contact[]>> {
        return this.makeRequest<Contact[]>(`/api/twins/${twinId}/contacts?relationship=${relationship}`);
    }

    /**
     * Get upcoming birthdays for contacts
     */
    async getUpcomingBirthdays(twinId: string, days: number = 30): Promise<ApiResponse<Contact[]>> {
        return this.makeRequest<Contact[]>(`/api/twins/${twinId}/contacts/birthdays?days=${days}`);
    }

    // ===========================================
    // EDUCATION MANAGEMENT METHODS
    // ===========================================

    /**
     * Get all education records for a twin
     */
    async getEducation(twinId: string): Promise<ApiResponse<Education[]>> {
        return this.makeRequest<Education[]>(`/api/twins/${twinId}/education`);
    }

    /**
     * Create a new education record for a twin
     */
    async createEducation(twinId: string, educationData: EducationData): Promise<ApiResponse<Education>> {
        console.log('📤 API Service - Creating education for twin:', twinId);
        console.log('📤 API Service - Education data received:', educationData);
        
        // Map to exact .NET backend property names (PascalCase)
        const backendData = {
            TwinID: twinId,
            Institution: (educationData as any).Institution,
            EducationType: (educationData as any).EducationType,
            DegreeObtained: (educationData as any).DegreeObtained || '',
            FieldOfStudy: (educationData as any).FieldOfStudy || '',
            StartDate: (educationData as any).StartDate,
            EndDate: (educationData as any).EndDate || '',
            InProgress: (educationData as any).InProgress,
            Country: (educationData as any).Country || '',
            Description: (educationData as any).Description || '',
            Achievements: (educationData as any).Achievements || '',
            Gpa: (educationData as any).Gpa || '',
            Credits: (educationData as any).Credits || 0,
            Type: (educationData as any).Type || 'education'
        };

        console.log('📤 API Service - Backend data being sent (.NET PascalCase):', backendData);

        return this.makeRequest<Education>(`/api/twins/${twinId}/education`, {
            method: 'POST',
            body: JSON.stringify(backendData)
        });
    }

    /**
     * Update an existing education record
     */
    async updateEducation(twinId: string, educationId: string, educationData: EducationData): Promise<ApiResponse<Education>> {
        // Use the structure directly (fields already match C# backend)
        const backendData = {
            Id: educationId,
            TwinID: twinId,
            Institucion: educationData.Institucion,
            TipoEducacion: educationData.TipoEducacion,
            TituloObtenido: educationData.TituloObtenido || '',
            CampoEstudio: educationData.CampoEstudio || '',
            FechaInicio: educationData.FechaInicio,
            FechaFin: educationData.FechaFin || '',
            EnProgreso: educationData.EnProgreso,
            Pais: educationData.Pais || '',
            Descripcion: educationData.Descripcion || '',
            LogrosDestacados: educationData.LogrosDestacados || '',
            Promedio: educationData.Promedio || '',
            Creditos: educationData.Creditos || 0,
            Type: educationData.Type || 'education'
        };

        return this.makeRequest<Education>(`/api/twins/${twinId}/education/${educationId}`, {
            method: 'PUT',
            body: JSON.stringify(backendData)
        });
    }

    /**
     * Delete an education record
     */
    async deleteEducation(twinId: string, educationId: string): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(`/api/twins/${twinId}/education/${educationId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get a specific education record by ID
     */
    async getEducationById(twinId: string, educationId: string): Promise<ApiResponse<Education>> {
        return this.makeRequest<Education>(`/api/twins/${twinId}/education/${educationId}`);
    }

    /**
     * Search education records by query (institution, field of study, etc.)
     */
    async searchEducation(twinId: string, query: string, educationType?: string): Promise<ApiResponse<Education[]>> {
        const params = new URLSearchParams();
        params.append('q', query);
        if (educationType && educationType !== 'todos') {
            params.append('type', educationType);
        }
        
        return this.makeRequest<Education[]>(`/api/twins/${twinId}/education/search?${params.toString()}`);
    }

    /**
     * Get education records by type
     */
    async getEducationByType(twinId: string, educationType: string): Promise<ApiResponse<Education[]>> {
        return this.makeRequest<Education[]>(`/api/twins/${twinId}/education?type=${educationType}`);
    }

    // ===========================================
    // FAMILY MANAGEMENT METHODS
    // ===========================================

    /**
     * Get all family members for a twin (actualizada para nueva API)
     */
    async getFamilyMembers(twinId: string): Promise<ApiResponse<FamilyMember[]>> {
        console.log('📤 API Service - Getting family members for twin:', twinId);
        
        try {
            const response = await this.makeRequest<{
                success: boolean;
                family: FamilyMember[];
                twinId: string;
                count: number;
            }>(`/api/twins/${twinId}/family`);
            
            if (response.success && response.data) {
                // Mapear los datos del backend al formato esperado por el frontend
                const familyMembers = response.data.family?.map(member => ({
                    id: member.id,
                    twinId: member.twinId,
                    // Nuevos campos de la API
                    parentesco: member.parentesco,
                    nombre: member.nombre,
                    apellido: member.apellido,
                    fechaNacimiento: member.fechaNacimiento,
                    numeroCelular: member.numeroCelular,
                    email: member.email,
                    urlFoto: member.urlFoto,
                    notas: member.notas,
                    createdDate: member.createdDate,
                    type: member.type,
                    // Campos legacy para compatibilidad
                    firstName: member.nombre, // Mapeo para compatibilidad
                    lastName: member.apellido,
                    relationshipType: member.parentesco,
                    dateOfBirth: member.fechaNacimiento,
                    phoneNumber: member.numeroCelular,
                    photoUrl: member.urlFoto,
                    notes: member.notas,
                    createdAt: member.createdDate
                })) || [];
                
                return {
                    success: true,
                    data: familyMembers,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al obtener miembros de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error getting family members:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al obtener miembros de familia'
            };
        }
    }

    /**
     * Create a new family member for a twin (actualizada para nueva API)
     */
    async createFamilyMember(twinId: string, familyMemberData: Omit<FamilyMember, 'id' | 'twinId' | 'createdDate' | 'type'>): Promise<ApiResponse<FamilyMember>> {
        console.log('📤 API Service - Creating family member for twin:', twinId);
        console.log('📤 API Service - Family member data received:', familyMemberData);
        
        // Mapear al formato esperado por la nueva API
        const apiData = {
            parentesco: familyMemberData.parentesco || familyMemberData.relationshipType || '',
            nombre: familyMemberData.nombre || familyMemberData.firstName || '',
            apellido: familyMemberData.apellido || familyMemberData.lastName || '',
            fecha_nacimiento: familyMemberData.fechaNacimiento || familyMemberData.dateOfBirth || '',
            numero_celular: familyMemberData.numeroCelular || familyMemberData.phoneNumber || '',
            email: familyMemberData.email || '',
            url_foto: familyMemberData.urlFoto || familyMemberData.photoUrl || '',
            notas: familyMemberData.notas || familyMemberData.notes || ''
        };

        console.log('📤 API Service - Data being sent to new API:', apiData);

        try {
            const response = await this.makeRequest<{
                success: boolean;
                family: FamilyMember;
                message: string;
            }>(`/api/twins/${twinId}/family`, {
                method: 'POST',
                body: JSON.stringify(apiData)
            });
            
            if (response.success && response.data) {
                // Mapear la respuesta al formato esperado por el frontend
                const familyMember = response.data.family;
                const mappedMember: FamilyMember = {
                    id: familyMember.id,
                    twinId: familyMember.twinId,
                    // Nuevos campos
                    parentesco: familyMember.parentesco,
                    nombre: familyMember.nombre,
                    apellido: familyMember.apellido,
                    fechaNacimiento: familyMember.fechaNacimiento,
                    numeroCelular: familyMember.numeroCelular,
                    email: familyMember.email,
                    urlFoto: familyMember.urlFoto,
                    notas: familyMember.notas,
                    createdDate: familyMember.createdDate,
                    type: familyMember.type,
                    // Campos legacy para compatibilidad
                    firstName: familyMember.nombre,
                    lastName: familyMember.apellido,
                    relationshipType: familyMember.parentesco,
                    dateOfBirth: familyMember.fechaNacimiento,
                    phoneNumber: familyMember.numeroCelular,
                    photoUrl: familyMember.urlFoto,
                    notes: familyMember.notas,
                    createdAt: familyMember.createdDate
                };
                
                return {
                    success: true,
                    data: mappedMember,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al crear miembro de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error creating family member:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al crear miembro de familia'
            };
        }
    }

    /**
     * Get a specific family member by ID
     * GET /api/twins/{twinId}/family/{familyId}
     */
    async getFamilyById(twinId: string, familyId: string): Promise<ApiResponse<FamilyMember>> {
        console.log('📤 API Service - Getting family member by ID:', familyId, 'for twin:', twinId);
        
        try {
            const response = await this.makeRequest<{
                success: boolean;
                family: FamilyMember;
                twinId: string;
                message: string;
            }>(`/api/twins/${twinId}/family/${familyId}`);
            
            if (response.success && response.data) {
                // Map the response to the expected frontend format
                const familyMember = response.data.family;
                const mappedMember: FamilyMember = {
                    id: familyMember.id,
                    twinId: familyMember.twinId,
                    // New API fields
                    parentesco: familyMember.parentesco,
                    nombre: familyMember.nombre,
                    apellido: familyMember.apellido,
                    fechaNacimiento: familyMember.fechaNacimiento,
                    numeroCelular: familyMember.numeroCelular,
                    email: familyMember.email,
                    urlFoto: familyMember.urlFoto,
                    notas: familyMember.notas,
                    createdDate: familyMember.createdDate,
                    
                    // Additional fields for edit page
                    idiomas: familyMember.idiomas || [],
                    intereses: familyMember.intereses || [],
                    direccionCompleta: familyMember.direccionCompleta || "",
                    paisNacimiento: familyMember.paisNacimiento || "",
                    nacionalidad: familyMember.nacionalidad || "",
                    genero: familyMember.genero || "",
                    ocupacion: familyMember.ocupacion || "",
                    nombreTwin: familyMember.nombreTwin || "",
                    telefono: familyMember.telefono || familyMember.numeroCelular || "",
                    
                    // Legacy fields for backward compatibility
                    firstName: familyMember.nombre,
                    lastName: familyMember.apellido,
                    relationshipType: familyMember.parentesco,
                    dateOfBirth: familyMember.fechaNacimiento,
                    phoneNumber: familyMember.numeroCelular,
                    photoUrl: familyMember.urlFoto,
                    notes: familyMember.notas,
                    createdAt: familyMember.createdDate
                };

                return {
                    success: true,
                    data: mappedMember,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al obtener miembro de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error getting family member by ID:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al obtener miembro de familia'
            };
        }
    }

    /**
     * Update an existing family member (actualizada para nueva API)
     */
    async updateFamilyMember(twinId: string, familyMemberId: string, familyMemberData: Partial<FamilyMember>): Promise<ApiResponse<FamilyMember>> {
        console.log('📤 API Service - Updating family member:', familyMemberId, 'for twin:', twinId);
        
        // Mapear al formato esperado por la nueva API
        const apiData = {
            parentesco: familyMemberData.parentesco || familyMemberData.relationshipType || '',
            nombre: familyMemberData.nombre || familyMemberData.firstName || '',
            apellido: familyMemberData.apellido || familyMemberData.lastName || '',
            fecha_nacimiento: familyMemberData.fechaNacimiento || familyMemberData.dateOfBirth || '',
            numero_celular: familyMemberData.numeroCelular || familyMemberData.phoneNumber || '',
            email: familyMemberData.email || '',
            url_foto: familyMemberData.urlFoto || familyMemberData.photoUrl || '',
            notas: familyMemberData.notas || familyMemberData.notes || ''
        };

        try {
            const response = await this.makeRequest<{
                success: boolean;
                family: FamilyMember;
                message: string;
            }>(`/api/twins/${twinId}/family/${familyMemberId}`, {
                method: 'PUT',
                body: JSON.stringify(apiData)
            });
            
            if (response.success && response.data) {
                // Mapear la respuesta al formato esperado por el frontend
                const familyMember = response.data.family;
                const mappedMember: FamilyMember = {
                    id: familyMember.id,
                    twinId: familyMember.twinId,
                    // Nuevos campos
                    parentesco: familyMember.parentesco,
                    nombre: familyMember.nombre,
                    apellido: familyMember.apellido,
                    fechaNacimiento: familyMember.fechaNacimiento,
                    numeroCelular: familyMember.numeroCelular,
                    email: familyMember.email,
                    urlFoto: familyMember.urlFoto,
                    notas: familyMember.notas,
                    createdDate: familyMember.createdDate,
                    type: familyMember.type,
                    // Campos legacy para compatibilidad
                    firstName: familyMember.nombre,
                    lastName: familyMember.apellido,
                    relationshipType: familyMember.parentesco,
                    dateOfBirth: familyMember.fechaNacimiento,
                    phoneNumber: familyMember.numeroCelular,
                    photoUrl: familyMember.urlFoto,
                    notes: familyMember.notas,
                    createdAt: familyMember.createdDate
                };
                
                return {
                    success: true,
                    data: mappedMember,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al actualizar miembro de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error updating family member:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al actualizar miembro de familia'
            };
        }
    }

    /**
     * Update family member using new FamilyData structure
     * PUT /api/twins/{twinId}/family/{familyId}
     */
    async updateFamilyMemberWithFamilyData(twinId: string, familyMemberId: string, familyData: Partial<FamilyData>): Promise<ApiResponse<FamilyMember>> {
        console.log('📤 API Service - Updating family member with FamilyData structure:', familyMemberId, 'for twin:', twinId);
        console.log('📤 Family data being sent:', familyData);
        
        try {
            const response = await this.makeRequest<{
                success: boolean;
                family: FamilyMember;
                message: string;
            }>(`/api/twins/${twinId}/family/${familyMemberId}`, {
                method: 'PUT',
                body: JSON.stringify(familyData)
            });
            
            if (response.success && response.data) {
                const familyMember = response.data.family;
                const mappedMember: FamilyMember = {
                    id: familyMember.id,
                    twinId: familyMember.twinId,
                    // Map from backend response
                    parentesco: familyMember.parentesco,
                    nombre: familyMember.nombre,
                    apellido: familyMember.apellido,
                    fechaNacimiento: familyMember.fechaNacimiento,
                    numeroCelular: familyMember.numeroCelular,
                    email: familyMember.email,
                    urlFoto: familyMember.urlFoto,
                    notas: familyMember.notas,
                    createdDate: familyMember.createdDate,
                    type: familyMember.type,
                    // Legacy fields for compatibility
                    firstName: familyMember.nombre,
                    lastName: familyMember.apellido,
                    relationshipType: familyMember.parentesco,
                    dateOfBirth: familyMember.fechaNacimiento,
                    phoneNumber: familyMember.numeroCelular,
                    photoUrl: familyMember.urlFoto,
                    notes: familyMember.notas,
                    createdAt: familyMember.createdDate
                };

                return {
                    success: true,
                    data: mappedMember,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al actualizar miembro de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error updating family member with FamilyData:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al actualizar miembro de familia'
            };
        }
    }

    /**
     * Delete a family member (actualizada para nueva API)
     */
    async deleteFamilyMember(twinId: string, familyMemberId: string): Promise<ApiResponse<void>> {
        console.log('📤 API Service - Deleting family member:', familyMemberId, 'for twin:', twinId);
        
        try {
            const response = await this.makeRequest<{
                success: boolean;
                familyId: string;
                twinId: string;
                message: string;
            }>(`/api/twins/${twinId}/family/${familyMemberId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                return {
                    success: true,
                    data: undefined,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al eliminar miembro de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error deleting family member:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al eliminar miembro de familia'
            };
        }
    }

    /**
     * Get a specific family member by ID (actualizada para nueva API)
     */
    async getFamilyMemberById(twinId: string, familyMemberId: string): Promise<ApiResponse<FamilyMember>> {
        try {
            const response = await this.makeRequest<{
                success: boolean;
                family: FamilyMember;
                familyId: string;
                twinId: string;
            }>(`/api/twins/${twinId}/family/${familyMemberId}`);
            
            if (response.success && response.data) {
                // Mapear la respuesta al formato esperado por el frontend
                const familyMember = response.data.family;
                const mappedMember: FamilyMember = {
                    id: familyMember.id,
                    twinId: familyMember.twinId,
                    // Nuevos campos
                    parentesco: familyMember.parentesco,
                    nombre: familyMember.nombre,
                    apellido: familyMember.apellido,
                    fechaNacimiento: familyMember.fechaNacimiento,
                    numeroCelular: familyMember.numeroCelular,
                    email: familyMember.email,
                    urlFoto: familyMember.urlFoto,
                    notas: familyMember.notas,
                    createdDate: familyMember.createdDate,
                    type: familyMember.type,
                    // Campos legacy para compatibilidad
                    firstName: familyMember.nombre,
                    lastName: familyMember.apellido,
                    relationshipType: familyMember.parentesco,
                    dateOfBirth: familyMember.fechaNacimiento,
                    phoneNumber: familyMember.numeroCelular,
                    photoUrl: familyMember.urlFoto,
                    notes: familyMember.notas,
                    createdAt: familyMember.createdDate
                };
                
                return {
                    success: true,
                    data: mappedMember,
                    error: undefined
                };
            } else {
                return {
                    success: false,
                    data: undefined,
                    error: response.error || 'Error al obtener miembro de familia'
                };
            }
        } catch (error) {
            console.error('❌ Error getting family member by ID:', error);
            return {
                success: false,
                data: undefined,
                error: 'Error al obtener miembro de familia'
            };
        }
    }

    /**
     * Search family members by name or relationship
     * @deprecated - No disponible en la nueva API, usar getFamilyMembers y filtrar en el frontend
     */
    async searchFamilyMembers(twinId: string, query: string, relationshipType?: string): Promise<ApiResponse<FamilyMember[]>> {
        // Como la nueva API no tiene endpoint de búsqueda, obtenemos todos y filtramos localmente
        const allMembersResponse = await this.getFamilyMembers(twinId);
        
        if (!allMembersResponse.success || !allMembersResponse.data) {
            return allMembersResponse;
        }
        
        const filteredMembers = allMembersResponse.data.filter(member => {
            const matchesQuery = query ? 
                `${member.nombre} ${member.apellido}`.toLowerCase().includes(query.toLowerCase()) ||
                member.parentesco?.toLowerCase().includes(query.toLowerCase()) :
                true;
                
            const matchesRelationship = relationshipType && relationshipType !== 'todos' ? 
                member.parentesco === relationshipType : 
                true;
                
            return matchesQuery && matchesRelationship;
        });
        
        return {
            success: true,
            data: filteredMembers,
            error: undefined
        };
    }

    /**
     * Get family members by relationship type
     * @deprecated - No disponible en la nueva API, usar getFamilyMembers y filtrar en el frontend
     */
    async getFamilyMembersByRelationship(twinId: string, relationshipType: string): Promise<ApiResponse<FamilyMember[]>> {
        // Como la nueva API no tiene filtros por URL, obtenemos todos y filtramos localmente
        const allMembersResponse = await this.getFamilyMembers(twinId);
        
        if (!allMembersResponse.success || !allMembersResponse.data) {
            return allMembersResponse;
        }
        
        const filteredMembers = allMembersResponse.data.filter(member => 
            member.parentesco === relationshipType
        );
        
        return {
            success: true,
            data: filteredMembers,
            error: undefined
        };
    }

    /**
     * Upload family member photo
     */
    async uploadFamilyMemberPhoto(twinId: string, familyMemberId: string, photoFile: File, fileName?: string): Promise<ApiResponse<{photoUrl: string, fileName: string, filePath: string, familyId: string}>> {
        console.log('📤 API Service - Uploading photo for family member:', familyMemberId);
        console.log('📄 File details:', {
            name: photoFile.name,
            size: photoFile.size,
            type: photoFile.type,
            lastModified: photoFile.lastModified
        });
        
        const formData = new FormData();
        
        // Create a new File object with custom filename if provided to ensure proper filename handling
        const fileToUpload = fileName ? new File([photoFile], fileName, { type: photoFile.type }) : photoFile;
        
        // Append the photo file and familyMemberId for backend processing
        formData.append('photo', fileToUpload);
        formData.append('familyMemberId', familyMemberId);
        
        console.log('📝 FormData contents:');
        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}:`, pair[1]);
        }

        return this.makeRequest<{photoUrl: string, fileName: string, filePath: string, familyId: string}>(`/api/twins/${twinId}/family/${familyMemberId}/upload-photo`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header for FormData - browser will set it automatically with boundary
            headers: {
                'X-API-Key': API_KEY
            }
        });
    }

    /**
     * Upload resume/CV for a twin
     */
    async uploadResume(twinId: string, resumeFile: File, fileName?: string): Promise<ApiResponse<{
        message: string,
        fileName: string,
        filePath: string,
        fileSize: number,
        uploadTime: string
    }>> {
        console.log('💼 API Service - Uploading resume for twin:', twinId);
        console.log('📄 Resume file details:', {
            name: resumeFile.name,
            size: resumeFile.size,
            type: resumeFile.type,
            lastModified: resumeFile.lastModified
        });
        
        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (!allowedTypes.includes(resumeFile.type)) {
            throw new Error('Invalid file type. Supported formats: PDF, DOC, DOCX, TXT');
        }
        
        const formData = new FormData();
        
        // Create a new File object with custom filename if provided
        const fileToUpload = fileName ? new File([resumeFile], fileName, { type: resumeFile.type }) : resumeFile;
        
        // Append the resume file - backend expects 'resume', 'file', or 'document'
        formData.append('resume', fileToUpload);
        
        // Optionally append custom fileName for backend processing
        if (fileName) {
            formData.append('fileName', fileName);
        }
        
        console.log('📝 FormData contents:');
        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}:`, pair[1]);
        }

        return this.makeRequest<{
            message: string,
            fileName: string,
            filePath: string,
            fileSize: number,
            uploadTime: string
        }>(`/api/twins/${twinId}/work/upload-resume`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header for FormData - browser will set it automatically with boundary
            headers: {
                'X-API-Key': API_KEY
            }
        });
    }

    /**
     * Get list of all resumes for a twin
     */
    async getResumeList(twinId: string): Promise<ApiResponse<ResumeListResponse>> {
        console.log('📋 API Service - Getting resume list for twin:', twinId);
        
        return this.makeRequest<ResumeListResponse>(`/api/twins/${twinId}/work/resumes`, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY
            }
        });
    }

    /**
     * Set active resume for a twin
     */
    async setActiveResume(twinId: string, fileName: string): Promise<ApiResponse<{
        message: string,
        activeResume: ResumeFile
    }>> {
        console.log('🎯 API Service - Setting active resume for twin:', twinId, 'fileName:', fileName);
        
        return this.makeRequest<{
            message: string,
            activeResume: ResumeFile
        }>(`/api/twins/${twinId}/work/active-resume`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ fileName })
        });
    }

    /**
     * Delete a resume file
     */
    async deleteResume(twinId: string, fileName: string): Promise<ApiResponse<{
        message: string,
        deletedFile: string
    }>> {
        console.log('🗑️ API Service - Deleting resume for twin:', twinId, 'fileName:', fileName);
        
        return this.makeRequest<{
            message: string,
            deletedFile: string
        }>(`/api/twins/${twinId}/work/resume/${encodeURIComponent(fileName)}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': API_KEY
            }
        });
    }

    /**
     * Download/view a resume file
     */
    async getResumeFile(twinId: string, fileName: string): Promise<ApiResponse<Blob>> {
        console.log('📥 API Service - Getting resume file for twin:', twinId, 'fileName:', fileName);
        
        const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/work/resume/${encodeURIComponent(fileName)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        return {
            success: true,
            data: blob,
            error: undefined
        };
    }

    /**
     * Test API connectivity
     */
    async testConnection(): Promise<ApiResponse<any>> {
        return this.makeRequest<any>('/api/health');
    }

    /**
     * Upload photo using simple upload endpoint
     * This is a NEW function specifically for homes/{photoId}/photos/{zona}
     */
    async uploadPhotoSimple(
        twinId: string, 
        photoFile: File, 
        photoId?: string,  // ID de la foto (opcional, se genera automáticamente si no se proporciona)
        filename?: string,
        zona?: string      // Zona de la casa (exterior, cocina, etc.)
    ): Promise<ApiResponse<{
        success: boolean;
        message: string;
        twinId: string;
        filePath: string;
        fileName: string;
        directory: string;
        photoUrl: string;
        fileSize: number;
        processingTimeSeconds: number;
    }>> {
        // Generar un nuevo ID si no se proporciona
        const finalPhotoId = photoId || crypto.randomUUID();
        // Construir el path incluyendo la zona si se proporciona
        const path = zona 
            ? `homes/${finalPhotoId}/photos/${zona}`
            : `homes/${finalPhotoId}/photos`;
        
        console.log('📸 API Service - Uploading photo simple for twin:', twinId, 'path:', path);
        
        try {
            // Create FormData
            const formData = new FormData();
            formData.append('photo', photoFile);
            formData.append('path', path);
            
            if (filename) {
                formData.append('filename', filename);
            }

            const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/simple-upload-photo/${encodeURIComponent(path)}`, {
                method: 'POST',
                headers: {
                    'X-API-Key': API_KEY
                    // NO agregar Content-Type, el browser lo hace automáticamente para FormData
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                return {
                    success: false,
                    data: undefined,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }

            const responseData = await response.json();
            console.log('✅ Photo upload successful:', responseData);
            
            return {
                success: true,
                data: responseData,
                error: undefined
            };
            
        } catch (error) {
            console.error('❌ Error uploading photo:', error);
            return {
                success: false,
                data: undefined,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * List photos from a specific path
     * NEW function to get photos from homes/{photoId}/photos/{zona}
     * Uses the specific endpoint: /api/twins/{twinId}/photos/path
     */
    async listPhotos(
        twinId: string,
        photoId: string,
        zona?: string
    ): Promise<ApiResponse<{
        success: boolean;
        message: string;
        photos: Array<{
            fileName: string;
            filePath: string;
            photoUrl: string;
            fileSize: number;
            lastModified: string;
            contentType: string;
            directory: string;
            createdOn: string;
            eTag: string;
            metadata?: any;
        }>;
        totalCount: number;
        totalFilesInPath: number;
        path: string;
        containerName: string;
        recursive: boolean;
        // Legacy fields for compatibility
        files?: Array<{
            fileName: string;
            filePath: string;
            photoUrl: string;
            fileSize: number;
            lastModified: string;
        }>;
        totalFiles?: number;
        directory?: string;
    }>> {
        // Construir el path para listar fotos - homes/casaId/photos/zona formato
        const path = zona 
            ? `homes/${photoId}/photos/${zona}`  // Formato: homes/casaId/photos/zona
            : `homes/${photoId}/photos`;          // homes/casaId/photos si no hay zona específica
        
        console.log('📋 API Service - Listing photos for twin:', twinId, 'path:', path);
        
        try {
            // Usar el nuevo endpoint /twins/{twinId}/photos/by-path/{path}
            const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/photos/by-path/${encodeURIComponent(path)}`, {
                method: 'GET',
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                return {
                    success: false,
                    data: undefined,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }

            const responseData = await response.json();
            console.log('✅ Photos list successful:', responseData);
            console.log('🔍 Response structure:', {
                success: responseData.success,
                totalCount: responseData.totalCount,
                path: responseData.path,
                twinId: responseData.twinId,
                message: responseData.message,
                analisisResidencialCount: responseData.analisisResidencial?.length || 0,
                rawAnalisisResidencial: responseData.analisisResidencial
            });
            console.log('🔍 Full response keys:', Object.keys(responseData));
            
            // Mapear la respuesta del nuevo endpoint usando los campos correctos
            const photos = (responseData.analisisResidencial || []).map((analisis: any, index: number) => {
                console.log(`📸 Photo ${index + 1}:`, {
                    id: analisis.id,
                    fileName: analisis.fileName,
                    filePath: analisis.filePath,
                    fileURL: analisis.fileURL,
                    descripcionGenerica: analisis.descripcionGenerica,
                    tipoEspacio: analisis.tipoEspacio, // Debug camelCase
                    TipoEspacio: analisis.TipoEspacio, // Debug PascalCase
                    allKeys: Object.keys(analisis), // Ver todas las claves disponibles
                    detailsHTML: analisis.detailsHtml ? 'Has HTML content' : 'No HTML',
                    detailsHTMLContent: analisis.detailsHtml,  // Log completo del HTML
                    fullAnalisisObject: analisis  // Ver estructura completa
                });
                
                return {
                    fileName: analisis.fileName || '',
                    filePath: analisis.filePath || '',
                    photoUrl: analisis.fileURL || '',
                    fileSize: 0, // No viene en AnalisisResidencialSummary
                    lastModified: '', // No viene en AnalisisResidencialSummary
                    contentType: 'image/jpeg', // Asumir imagen por defecto
                    directory: path,
                    createdOn: '', // No viene en AnalisisResidencialSummary
                    eTag: analisis.id || '',
                    metadata: {
                        id: analisis.id,
                        twinID: analisis.twinID,
                        tipoEspacio: analisis.tipoEspacio || analisis.TipoEspacio, // Intentar ambas versiones
                        descripcionGenerica: analisis.descripcionGenerica,
                        detailsHTML: analisis.detailsHtml, // Corregir: detailsHtml en lugar de detailsHTML
                        originalData: analisis
                    }
                };
            });
            
            console.log(`📊 Mapped ${photos.length} photos for display`);
            
            // Mapear la respuesta al formato esperado por el frontend
            const mappedResponse = {
                success: responseData.success || true,
                message: responseData.message || `Se encontraron ${photos.length} fotos`,
                photos: photos,
                totalCount: responseData.totalCount || photos.length,
                totalFilesInPath: responseData.totalCount || photos.length,
                path: responseData.path || path,
                containerName: '',
                recursive: false,
                // Campos legacy para compatibilidad
                files: photos,
                totalFiles: photos.length,
                directory: responseData.path || path,
                // Datos adicionales del backend
                twinId: responseData.twinId,
                rawAnalisisData: responseData.analisisResidencial
            };
            
            return {
                success: true,
                data: mappedResponse,
                error: undefined
            };
            
        } catch (error) {
            console.error('❌ Error listing photos:', error);
            return {
                success: false,
                data: undefined,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Upload a global document for a twin
     * Uses the new endpoint: POST /api/twins/{twinId}/global-documents
     */
    async uploadGlobalDocument(
        twinId: string,
        file: File,
        options?: {
            path?: string;
            fileName?: string;
            documentType?: string;
            category?: string;
            description?: string;
        }
    ): Promise<ApiResponse<{
        success: boolean;
        message: string;
        twinId: string;
        filePath: string;
        fileName: string;
        directory: string;
        documentUrl: string;
        fileSize: number;
        processingTimeSeconds: number;
        documentType: string;
        category: string;
        description?: string;
    }>> {
        console.log('📄 API Service - Uploading global document for twin:', twinId);
        console.log('📄 File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
        console.log('📄 Upload options:', options);
        
        const formData = new FormData();
        
        // Archivo obligatorio
        formData.append('file', file);
        
        // Campos opcionales
        if (options?.path) {
            formData.append('path', options.path);
        }
        if (options?.fileName) {
            formData.append('fileName', options.fileName);
        }
        if (options?.documentType) {
            formData.append('documentType', options.documentType);
        }
        if (options?.category) {
            formData.append('category', options.category);
        }
        if (options?.description) {
            formData.append('description', options.description);
        }
        
        console.log('📝 FormData contents:');
        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}:`, pair[1]);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/global-documents`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-API-Key': API_KEY
                    // No agregar Content-Type para FormData - el browser lo establece automáticamente
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Document upload error:', errorText);
                return {
                    success: false,
                    data: undefined,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }

            const responseData = await response.json();
            console.log('✅ Document upload successful:', responseData);
            
            return {
                success: true,
                data: responseData,
                error: undefined
            };
            
        } catch (error) {
            console.error('❌ Error uploading document:', error);
            return {
                success: false,
                data: undefined,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Get global documents by category for a twin
     * Uses the endpoint: GET /api/twins/{twinId}/global-documents/categories
     */
    async getGlobalDocumentsByCategory(
        twinId: string,
        category: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<ApiResponse<{
        success: boolean;
        category: string;
        totalDocuments: number;
        documents: Array<{
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
        }>;
        limit: number;
        offset: number;
        retrievedAt: string;
    }>> {
        console.log('📄 API Service - Getting global documents by category for twin:', twinId, 'category:', category);
        
        const params = new URLSearchParams();
        params.append('category', category);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        return this.makeRequest(`/api/twins/${twinId}/global-documents/categories?${params.toString()}`, {
            method: 'GET'
        });
    }

    /**
     * Get all family photos with AI analysis for a Twin
     */
    async getFamilyPhotosWithAI(twinId: string): Promise<ApiResponse<{
        success: boolean;
        twinId: string;
        photos: ImageAI[];
        count: number;
        message: string;
        retrievedAt: string;
    }>> {
        console.log('📸 API Service - Getting family photos with AI analysis for twin:', twinId);
        
        // Intentar primero con el proxy de Vite, luego con URL directa si falla
        try {
            return await this.makeRequest(`/api/twins/${twinId}/family-photos`, {
                method: 'GET'
            });
        } catch (error) {
            console.warn('⚠️ Proxy failed, trying direct URL to backend...', error);
            
            // Fallback: usar URL directa del backend
            const directUrl = `http://localhost:7011/api/twins/${twinId}/family-photos`;
            console.log('🔄 Making direct API request to:', directUrl);
            
            const response = await fetch(directUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Direct API Error (${response.status}):`, errorText);
                
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                return {
                    success: false,
                    data: undefined,
                    error: errorMessage
                };
            }

            const data = await response.json();
            console.log('✅ Direct API response:', data);
            
            return {
                success: true,
                data: data,
                error: undefined
            };
        }
    }

    /**
     * Search family photos using semantic search
     */
    async searchFamilyPictures(
        twinId: string, 
        query: string
    ): Promise<ApiResponse<FamilyPhotosSearchResult>> {
        console.log('🔍 API Service - Searching family pictures for twin:', twinId, 'with query:', query);
        
        // Intentar primero con el proxy de Vite, luego con URL directa si falla
        try {
            return await this.makeRequest(`/api/twins/${twinId}/search-family-pictures?query=${encodeURIComponent(query)}`, {
                method: 'GET'
            });
        } catch (error) {
            console.warn('⚠️ Proxy failed, trying direct URL to backend...', error);
            
            // Fallback: usar URL directa del backend
            const directUrl = `http://localhost:7011/api/twins/${twinId}/search-family-pictures?query=${encodeURIComponent(query)}`;
            console.log('🔄 Making direct API request to:', directUrl);
            
            const response = await fetch(directUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Direct API Error (${response.status}):`, errorText);
                
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                return {
                    success: false,
                    data: undefined,
                    error: errorMessage
                };
            }

            const data = await response.json();
            console.log('✅ Direct API response for search:', data);
            
            return {
                success: true,
                data: data,
                error: undefined
            };
        }
    }
}

// Export singleton instance
export const twinApiService = new TwinApiService();
export default twinApiService;
