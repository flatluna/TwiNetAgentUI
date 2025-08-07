/**
 * API service for Twin operations
 */

// En desarrollo, usar rutas relativas para aprovechar el proxy de Vite
// En producción, usar la URL completa
const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:7072' // Usar URL completa temporalmente para debug
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7072');

console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
console.log('🔧 Development mode:', import.meta.env.DEV);

const API_KEY = import.meta.env.VITE_API_KEY || 'B509918774DDE22A5BF94EDB4F145CB6E06F1CBCCC49D492D27FFD4AC3667A71';

export interface TwinProfileData {
    twinId?: string; // Add twinId field for backend compatibility
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

// Contact interfaces
export interface ContactData {
    contact_id?: string;
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
}

export interface ContactResponse extends ContactData {
    contact_id: string;
    created_at: string;
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
            console.log('📋 Request config:', config);

            const response = await fetch(url, config);
            
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
            // Handle contacts endpoint that returns {contacts: [...], count: number}
            else if (data && data.contacts && Array.isArray(data.contacts)) {
                // Map Spanish field names to English for contacts
                responseData = data.contacts.map((contact: any) => this.mapContactFromBackend(contact));
                console.log('🔧 Extracted and mapped contacts data:', responseData);
            }
            // Handle single contact response (for create/update operations)
            else if (data && (data.nombre || data.apellido)) {
                responseData = this.mapContactFromBackend(data);
                console.log('🔧 Mapped single contact data:', responseData);
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
     * Helper method to map contact data from backend (Spanish) to frontend (English)
     */
    private mapContactFromBackend(backendContact: any): ContactResponse {
        return {
            contact_id: backendContact.contact_id || backendContact.id,
            first_name: backendContact.nombre || '',
            last_name: backendContact.apellido || '',
            nickname: backendContact.apodo || '',
            phone_mobile: backendContact.telefono_movil || '',
            phone_work: backendContact.telefono_trabajo || '',
            phone_home: backendContact.telefono_casa || '',
            email: backendContact.email || '',
            address: backendContact.direccion || '',
            company: backendContact.empresa || '',
            position: backendContact.posicion || '',
            relationship: backendContact.relacion || 'otro',
            birthday: backendContact.cumpleanos || '',
            notes: backendContact.notas || '',
            created_at: backendContact.created_at || backendContact.fecha_creacion || '',
            updated_at: backendContact.updated_at || backendContact.fecha_actualizacion || ''
        };
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
     * Get all Twin profiles
     * GET /api/twin-profiles
     */
    async getAllTwins(): Promise<ApiResponse<TwinProfileResponse[]>> {
        return this.makeRequest<TwinProfileResponse[]>('/api/twin-profiles');
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
     * Upload a family photo for a twin using FormData (new API)
     */
    async uploadFamilyPhotoWithMetadata(
        twinId: string,
        file: File,
        metadata: {
            description?: string;
            date_taken: string;
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
        console.log('📷 Uploading family photo with metadata:');
        console.log('  - Twin ID:', twinId);
        console.log('  - File:', file.name, file.size, 'bytes');
        console.log('  - Metadata received:', metadata);

        // Create FormData
        const formData = new FormData();
        formData.append('photo', file);
        
        // Metadata with custom path for family photos
        const photoMetadata = {
            description: metadata.description,
            date_taken: metadata.date_taken,
            location: metadata.location,
            country: metadata.country,
            place: metadata.place,
            people_in_photo: metadata.people_in_photo,
            category: "Familia",
            tags: metadata.tags,
            file_path: `familia/${metadata.event_type}/${file.name}` // Using event_type in path instead of category
        };
        
        console.log('🔍 Photo metadata being sent to backend:', photoMetadata);
        
        formData.append('metadata', JSON.stringify(photoMetadata));

        // Use fetch directly for FormData (don't use makeRequest as it adds JSON headers)
        try {
            const response = await fetch(`${API_BASE_URL}/api/twins/${twinId}/upload-photo-with-metadata`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                    // Don't set Content-Type, let browser set it with boundary for FormData
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Photo upload failed:', response.status, errorText);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`,
                    data: undefined
                };
            }

            const data = await response.json();
            console.log('✅ Photo uploaded successfully:', data);
            
            return {
                success: true,
                data: data,
                error: undefined
            };
        } catch (error) {
            console.error('❌ Error uploading photo:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                data: undefined
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
            TwinID: string;
            description: string;
            dateTaken: string;
            location: string;
            country: string;
            place: string;
            peopleInPhoto: string;
            category: string;
            tags: string;
            filePath: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            uploadDate: string;
            type: string;
            photoUrl: string;
        }>;
        count: number;
        searchTerm: string | null;
        category: string | null;
        message: string;
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
        return this.makeRequest(`/api/twins/${twinId}/photos/${photoId}`, {
            method: 'DELETE'
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
    async getContacts(twinId: string): Promise<ApiResponse<ContactResponse[]>> {
        return this.makeRequest<ContactResponse[]>(`/api/twins/${twinId}/contacts`);
    }

    /**
     * Create a new contact for a twin
     */
    async createContact(twinId: string, contactData: ContactData): Promise<ApiResponse<ContactResponse>> {
        // Map frontend fields (English) to backend fields (Spanish)
        const backendData = {
            nombre: contactData.first_name,
            apellido: contactData.last_name,
            apodo: contactData.nickname || '',
            telefono_movil: contactData.phone_mobile || '',
            telefono_trabajo: contactData.phone_work || '',
            telefono_casa: contactData.phone_home || '',
            email: contactData.email || '',
            direccion: contactData.address || '',
            empresa: contactData.company || '',
            posicion: contactData.position || '',
            relacion: contactData.relationship,
            cumpleanos: contactData.birthday || '',
            notas: contactData.notes || ''
        };

        return this.makeRequest<ContactResponse>(`/api/twins/${twinId}/contacts`, {
            method: 'POST',
            body: JSON.stringify(backendData)
        });
    }

    /**
     * Update an existing contact
     */
    async updateContact(twinId: string, contactId: string, contactData: ContactData): Promise<ApiResponse<ContactResponse>> {
        // Map frontend fields (English) to backend fields (Spanish)
        const backendData = {
            nombre: contactData.first_name,
            apellido: contactData.last_name,
            apodo: contactData.nickname || '',
            telefono_movil: contactData.phone_mobile || '',
            telefono_trabajo: contactData.phone_work || '',
            telefono_casa: contactData.phone_home || '',
            email: contactData.email || '',
            direccion: contactData.address || '',
            empresa: contactData.company || '',
            posicion: contactData.position || '',
            relacion: contactData.relationship,
            cumpleanos: contactData.birthday || '',
            notas: contactData.notes || ''
        };

        return this.makeRequest<ContactResponse>(`/api/twins/${twinId}/contacts/${contactId}`, {
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
    async getContactById(twinId: string, contactId: string): Promise<ApiResponse<ContactResponse>> {
        return this.makeRequest<ContactResponse>(`/api/twins/${twinId}/contacts/${contactId}`);
    }

    /**
     * Search contacts by query (name, email, company, etc.)
     */
    async searchContacts(twinId: string, query: string, relationship?: string): Promise<ApiResponse<ContactResponse[]>> {
        const params = new URLSearchParams();
        params.append('q', query);
        if (relationship && relationship !== 'todos') {
            params.append('relationship', relationship);
        }
        
        return this.makeRequest<ContactResponse[]>(`/api/twins/${twinId}/contacts/search?${params.toString()}`);
    }

    /**
     * Get contacts by relationship type
     */
    async getContactsByRelationship(twinId: string, relationship: string): Promise<ApiResponse<ContactResponse[]>> {
        return this.makeRequest<ContactResponse[]>(`/api/twins/${twinId}/contacts?relationship=${relationship}`);
    }

    /**
     * Get upcoming birthdays for contacts
     */
    async getUpcomingBirthdays(twinId: string, days: number = 30): Promise<ApiResponse<ContactResponse[]>> {
        return this.makeRequest<ContactResponse[]>(`/api/twins/${twinId}/contacts/birthdays?days=${days}`);
    }

    /**
     * Test API connectivity
     */
    async testConnection(): Promise<ApiResponse<any>> {
        return this.makeRequest<any>('/api/health');
    }
}

// Export singleton instance
export const twinApiService = new TwinApiService();
export default twinApiService;
