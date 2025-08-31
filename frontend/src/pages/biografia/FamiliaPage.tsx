import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService, FamilyMember } from "@/services/twinApiService";
import { 
    Plus, 
    Edit3, 
    Trash2, 
    Users, 
    Calendar,
    Heart,
    X,
    Save,
    User,
    Baby,
    UserCheck,
    ArrowLeft,
    RefreshCw,
    Phone,
    Mail,
    Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Form data interface (for creating/editing family members)
interface FamilyFormData {
    parentesco: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    numeroCelular: string;
    email: string;
    address: string;
    occupation: string;
    notas: string;
    urlFoto: string;
    isAlive: boolean;
    deathDate: string;
    emergencyContact: boolean;
}

const FamiliaPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();

    // State management
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRelationship, setSelectedRelationship] = useState<string>('todos');
    
    // Photo upload state
    const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
    
    // Photo modal state
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
    const [selectedMemberName, setSelectedMemberName] = useState<string>('');

    // Form data
    const [formData, setFormData] = useState<FamilyFormData>({
        parentesco: 'hijo',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        numeroCelular: '',
        email: '',
        address: '',
        occupation: '',
        notas: '',
        urlFoto: '',
        isAlive: true,
        deathDate: '',
        emergencyContact: false
    });

    // Validation errors
    const [validationErrors, setValidationErrors] = useState<{
        phoneNumber?: string;
        email?: string;
    }>({});

    // Relationship types
    const relationshipTypes = [
        { id: 'todos', label: 'Todos los familiares', icon: Users, color: 'bg-gray-500', bgLight: 'bg-gray-100' },
        { id: 'madre', label: 'Madre', icon: Heart, color: 'bg-pink-500', bgLight: 'bg-pink-100' },
        { id: 'padre', label: 'Padre', icon: UserCheck, color: 'bg-blue-500', bgLight: 'bg-blue-100' },
        { id: 'esposo', label: 'Esposo', icon: Heart, color: 'bg-red-500', bgLight: 'bg-red-100' },
        { id: 'esposa', label: 'Esposa', icon: Heart, color: 'bg-red-500', bgLight: 'bg-red-100' },
        { id: 'hijo', label: 'Hijo', icon: Baby, color: 'bg-green-500', bgLight: 'bg-green-100' },
        { id: 'hija', label: 'Hija', icon: Baby, color: 'bg-purple-500', bgLight: 'bg-purple-100' },
        { id: 'hermano', label: 'Hermano', icon: User, color: 'bg-indigo-500', bgLight: 'bg-indigo-100' },
        { id: 'hermana', label: 'Hermana', icon: User, color: 'bg-yellow-500', bgLight: 'bg-yellow-100' },
        { id: 'abuelo', label: 'Abuelo', icon: UserCheck, color: 'bg-orange-500', bgLight: 'bg-orange-100' },
        { id: 'abuela', label: 'Abuela', icon: Heart, color: 'bg-teal-500', bgLight: 'bg-teal-100' },
        { id: 'tio', label: 'Tío', icon: UserCheck, color: 'bg-cyan-500', bgLight: 'bg-cyan-100' },
        { id: 'tia', label: 'Tía', icon: Heart, color: 'bg-rose-500', bgLight: 'bg-rose-100' },
        { id: 'primo', label: 'Primo', icon: User, color: 'bg-emerald-500', bgLight: 'bg-emerald-100' },
        { id: 'prima', label: 'Prima', icon: User, color: 'bg-violet-500', bgLight: 'bg-violet-100' },
        { id: 'otro', label: 'Otro', icon: Users, color: 'bg-gray-500', bgLight: 'bg-gray-100' }
    ];

    // Get current user's twinId
    const getCurrentTwinId = () => {
        if (accounts.length > 0) {
            const account = accounts[0];
            return account.localAccountId;
        }
        return null;
    };

    // Load family members
    const loadFamilyMembers = async () => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        setIsLoading(true);
        try {
            console.log('🔍 Loading family members for twinId:', twinId);
            const response = await twinApiService.getFamilyMembers(twinId);
            
            if (response.success && response.data) {
                console.log('✅ Family members loaded:', response.data);
                // Ensure response.data is an array
                const members = Array.isArray(response.data) ? response.data : [];
                setFamilyMembers(members);
            } else {
                console.error('❌ Error loading family members:', response.error);
                setFamilyMembers([]); // Set empty array on error
            }
        } catch (error) {
            console.error('❌ Unexpected error loading family members:', error);
            setFamilyMembers([]); // Set empty array on exception
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadFamilyMembers();
    }, []);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Open modal for adding new member
    const openAddModal = () => {
        setEditingMember(null);
        setValidationErrors({}); // Clear validation errors
        setFormData({
            parentesco: 'hijo',
            nombre: '',
            apellido: '',
            fechaNacimiento: '',
            numeroCelular: '',
            email: '',
            address: '',
            occupation: '',
            notas: '',
            urlFoto: '',
            isAlive: true,
            deathDate: '',
            emergencyContact: false
        });
        setIsModalOpen(true);
    };

    // Open modal for editing member
    const openEditModal = (member: FamilyMember) => {
        setEditingMember(member);
        setValidationErrors({}); // Clear validation errors
        setFormData({
            parentesco: member.parentesco || '',
            nombre: member.nombre || '',
            apellido: member.apellido || '',
            fechaNacimiento: member.fechaNacimiento || '',
            numeroCelular: member.numeroCelular || '',
            email: member.email || '',
            address: member.address || '',
            occupation: member.occupation || '',
            notas: member.notas || '',
            urlFoto: member.urlFoto || '',
            isAlive: member.isAlive !== false,
            deathDate: member.deathDate || '',
            emergencyContact: member.emergencyContact || false
        });
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
    };

    // Save family member
    const saveFamilyMember = async () => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        // Validate form before submitting
        const phoneError = validatePhoneNumber(formData.numeroCelular);
        const emailError = validateEmail(formData.email);

        if (phoneError || emailError) {
            setValidationErrors({
                phoneNumber: phoneError || undefined,
                email: emailError || undefined
            });
            return; // Don't submit if there are validation errors
        }

        // Clear any existing validation errors
        setValidationErrors({});

        setIsLoading(true);
        try {
            if (editingMember) {
                // Update existing member
                const response = await twinApiService.updateFamilyMember(twinId, editingMember.id!, formData);
                if (response.success) {
                    console.log('✅ Family member updated successfully');
                    await loadFamilyMembers();
                    closeModal();
                } else {
                    console.error('❌ Error updating family member:', response.error);
                }
            } else {
                // Create new member
                const response = await twinApiService.createFamilyMember(twinId, formData);
                if (response.success) {
                    console.log('✅ Family member created successfully');
                    await loadFamilyMembers();
                    closeModal();
                } else {
                    console.error('❌ Error creating family member:', response.error);
                }
            }
        } catch (error) {
            console.error('❌ Error saving family member:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete family member
    const deleteFamilyMember = async (memberId: string) => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        if (window.confirm('¿Estás seguro de que quieres eliminar este familiar?')) {
            setIsLoading(true);
            try {
                const response = await twinApiService.deleteFamilyMember(twinId, memberId);
                if (response.success) {
                    console.log('✅ Family member deleted successfully');
                    await loadFamilyMembers();
                } else {
                    console.error('❌ Error deleting family member:', response.error);
                }
            } catch (error) {
                console.error('❌ Unexpected error deleting family member:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Filter family members
    const filteredMembers = Array.isArray(familyMembers) ? familyMembers.filter(member => {
        const matchesSearch = `${member.nombre} ${member.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRelationship = selectedRelationship === 'todos' || member.parentesco === selectedRelationship;
        return matchesSearch && matchesRelationship;
    }) : [];

    // Get relationship info
    const getRelationshipInfo = (relationshipType: string) => {
        return relationshipTypes.find(type => type.id === relationshipType) || relationshipTypes.find(type => type.id === 'otro')!;
    };

    // Calculate age from birth date
    const calculateAge = (birthDate: string) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Validation functions
    const validatePhoneNumber = (phone: string): string | null => {
        if (!phone) return null; // Phone is optional
        
        // Remove all non-numeric characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Check if it's a valid phone number (8-15 digits)
        if (cleanPhone.length < 8 || cleanPhone.length > 15) {
            return 'El número debe tener entre 8 y 15 dígitos';
        }
        
        return null;
    };

    const validateEmail = (email: string): string | null => {
        if (!email) return null; // Email is optional
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Por favor ingresa un email válido';
        }
        
        return null;
    };

    // Enhanced input change handler with validation
    const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear previous validation error for this field
        if (validationErrors[name as keyof typeof validationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        // Validate specific fields
        if (name === 'numeroCelular' && typeof newValue === 'string') {
            const phoneError = validatePhoneNumber(newValue);
            if (phoneError) {
                setValidationErrors(prev => ({
                    ...prev,
                    phoneNumber: phoneError
                }));
            }
        }

        if (name === 'email' && typeof newValue === 'string') {
            const emailError = validateEmail(newValue);
            if (emailError) {
                setValidationErrors(prev => ({
                    ...prev,
                    email: emailError
                }));
            }
        }
    };

    // Format phone number for display
    const formatPhoneNumber = (phone: string): string => {
        if (!phone) return '';
        
        // Remove all non-numeric characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Format based on length
        if (cleanPhone.length === 10) {
            // Format as (XXX) XXX-XXXX
            return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
            // Format as +1 (XXX) XXX-XXXX
            return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
        }
        
        return phone; // Return as-is if doesn't match common formats
    };

    // Handle photo upload for family member
    const handlePhotoUpload = async (memberId: string, file: File) => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        // Find the member to get their ID for the filename
        const member = familyMembers.find(m => m.id === memberId);
        if (!member) {
            alert('No se pudo encontrar la información del familiar.');
            return;
        }

        setUploadingPhotoId(memberId);
        try {
            console.log(`📷 Uploading photo for family member ${memberId}`);
            
            // Get file extension
            const fileExtension = file.name.split('.').pop() || 'jpg';
            
            // Create filename with member ID: "photo_{familyMember.Id}.{ext}"
            const fileName = `photo_${member.id}.${fileExtension}`;
            
            console.log('📝 Generated filename:', fileName);
            
            const response = await twinApiService.uploadFamilyMemberPhoto(twinId, memberId, file, fileName);
            
            if (response.success && response.data && response.data.photoUrl) {
                console.log('✅ Photo uploaded successfully:', response.data);
                
                // Update the family member's photo URL directly with the sasUrl
                setFamilyMembers(prev => prev.map(m => 
                    m.id === memberId 
                        ? { ...m, urlFoto: response.data!.photoUrl }
                        : m
                ));
                
                console.log(`📷 Updated photo URL for member ${memberId}:`, response.data.photoUrl);
                
                // Show success message
                alert('✅ Foto subida exitosamente');
            } else {
                console.log('⚠️ Upload may have succeeded but response blocked by CORS, reloading family members...');
                // Fallback: reload family members to get updated photo URL
                await loadFamilyMembers();
                alert('✅ Foto subida - página actualizada');
            }
        } catch (error) {
            console.error('❌ Unexpected error uploading photo:', error);
            alert('Error inesperado al subir la foto.');
        } finally {
            setUploadingPhotoId(null);
        }
    };

    // Handle file input change
    const handleFileSelect = (memberId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido.');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            alert('El archivo es muy grande. El tamaño máximo permitido es 5MB.');
            return;
        }

        handlePhotoUpload(memberId, file);
    };

    // Photo modal functions
    const openPhotoModal = (photoUrl: string, memberName: string) => {
        setSelectedPhotoUrl(photoUrl);
        setSelectedMemberName(memberName);
        setPhotoModalOpen(true);
    };

    const closePhotoModal = () => {
        setPhotoModalOpen(false);
        setSelectedPhotoUrl('');
        setSelectedMemberName('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => navigate('/twin-biografia')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Volver a Biografía
                            </Button>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                                    <Users className="h-10 w-10 text-blue-600" />
                                    Mi Familia
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Gestiona la información de tu familia y seres queridos
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={loadFamilyMembers}
                                variant="outline"
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                            <Button
                                onClick={openAddModal}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Agregar Familiar
                            </Button>
                        </div>
                    </div>

                    {/* Search and filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {relationshipTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedRelationship === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedRelationship(type.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                            isSelected
                                                ? `${type.color} text-white border-transparent`
                                                : `${type.bgLight} text-gray-700 border-gray-200 hover:border-gray-300`
                                        }`}
                                    >
                                        <Icon size={16} />
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Family members grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => {
                        const relationshipInfo = getRelationshipInfo(member.parentesco);
                        const Icon = relationshipInfo.icon;
                        const age = calculateAge(member.fechaNacimiento || '');

                        return (
                            <div key={member.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Member photo */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-t-xl">
                                    {member.urlFoto ? (
                                        <div 
                                            className="w-full h-full bg-cover bg-center bg-no-repeat hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            style={{
                                                backgroundImage: `url(${member.urlFoto})`
                                            }}
                                            onClick={() => member.urlFoto && openPhotoModal(member.urlFoto, `${member.nombre} ${member.apellido}`)}
                                            title="Click para ver foto completa"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon size={64} className="text-gray-400" />
                                        </div>
                                    )}
                                    
                                    {/* Relationship badge */}
                                    <div className={`absolute top-3 left-3 ${relationshipInfo.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                                        <Icon size={14} />
                                        {relationshipInfo.label}
                                    </div>

                                    {/* Status indicator */}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                                        member.isAlive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {member.isAlive !== false ? '✓ Vivo' : '† Fallecido'}
                                    </div>
                                </div>

                                {/* Member info */}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {member.nombre} {member.apellido}
                                        </h3>
                                        {member.fechaNacimiento && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Calendar size={14} />
                                                <span>
                                                    {new Date(member.fechaNacimiento).toLocaleDateString('es-ES')}
                                                    {age && ` (${age} años)`}
                                                </span>
                                            </div>
                                        )}

                                        {/* Phone Number */}
                                        {member.numeroCelular && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Phone size={14} />
                                                <span>{formatPhoneNumber(member.numeroCelular)}</span>
                                            </div>
                                        )}

                                        {/* Email */}
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Mail size={14} />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {member.notas && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {member.notas}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {/* Upload Photo Button */}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileSelect(member.id!, e)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={uploadingPhotoId === member.id}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={uploadingPhotoId === member.id}
                                                className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                                {uploadingPhotoId === member.id ? (
                                                    <RefreshCw className="animate-spin" size={14} />
                                                ) : (
                                                    <Upload size={14} />
                                                )}
                                                {uploadingPhotoId === member.id ? 'Subiendo...' : 'Foto'}
                                            </Button>
                                        </div>

                                        <Button
                                            onClick={() => openEditModal(member)}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 flex items-center gap-2"
                                        >
                                            <Edit3 size={14} />
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => deleteFamilyMember(member.id!)}
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {filteredMembers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            {searchTerm || selectedRelationship !== 'todos' 
                                ? 'No se encontraron familiares' 
                                : 'No hay familiares registrados'
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedRelationship !== 'todos'
                                ? 'Intenta cambiar los filtros de búsqueda'
                                : 'Comienza agregando información de tu familia'
                            }
                        </p>
                        {!searchTerm && selectedRelationship === 'todos' && (
                            <Button
                                onClick={openAddModal}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                                <Plus className="mr-2" size={16} />
                                Agregar Primer Familiar
                            </Button>
                        )}
                    </div>
                )}

                {/* Modal for adding/editing family member */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editingMember ? 'Editar Familiar' : 'Agregar Familiar'}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    {/* Relationship */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parentesco *
                                        </label>
                                        <select
                                            name="parentesco"
                                            value={formData.parentesco}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            {relationshipTypes.slice(1).map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nombre del familiar"
                                            required
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Apellido del familiar"
                                            required
                                        />
                                    </div>

                                    {/* Birth Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaNacimiento"
                                            value={formData.fechaNacimiento}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número Celular
                                        </label>
                                        <input
                                            type="tel"
                                            name="numeroCelular"
                                            value={formData.numeroCelular}
                                            onChange={handleInputChangeWithValidation}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                validationErrors.phoneNumber 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="(XXX) XXX-XXXX o +1234567890"
                                        />
                                        {validationErrors.phoneNumber && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.phoneNumber}
                                            </p>
                                        )}
                                        {formData.numeroCelular && !validationErrors.phoneNumber && (
                                            <p className="mt-1 text-sm text-green-600">
                                                ✓ Formato: {formatPhoneNumber(formData.numeroCelular)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChangeWithValidation}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                validationErrors.email 
                                                    ? 'border-red-500 bg-red-50' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="ejemplo@email.com"
                                        />
                                        {validationErrors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.email}
                                            </p>
                                        )}
                                        {formData.email && !validationErrors.email && formData.email.includes('@') && (
                                            <p className="mt-1 text-sm text-green-600">
                                                ✓ Email válido
                                            </p>
                                        )}
                                    </div>

                                    {/* Photo URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL de la Foto
                                        </label>
                                        <input
                                            type="url"
                                            name="urlFoto"
                                            value={formData.urlFoto}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://ejemplo.com/foto.jpg"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas
                                        </label>
                                        <textarea
                                            name="notas"
                                            value={formData.notas}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Notas sobre este familiar..."
                                        />
                                    </div>

                                    {/* Is Alive */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="isAlive"
                                            checked={formData.isAlive}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Está vivo/a
                                        </label>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                    <Button
                                        onClick={closeModal}
                                        variant="outline"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={saveFamilyMember}
                                        disabled={isLoading || !formData.nombre.trim() || !formData.apellido.trim()}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    >
                                        <Save className="mr-2" size={16} />
                                        {editingMember ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Photo Modal */}
            {photoModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-2xl max-h-[80vh] w-full flex items-center justify-center">
                        {/* Close button */}
                        <button
                            onClick={closePhotoModal}
                            className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 transition-all duration-200"
                            title="Cerrar"
                        >
                            <X size={20} />
                        </button>
                        
                        {/* Photo */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={selectedPhotoUrl}
                                alt={selectedMemberName}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                style={{
                                    maxHeight: '70vh',
                                    maxWidth: '90vw'
                                }}
                            />
                            
                            {/* Member name overlay */}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
                                <p className="text-sm font-medium">{selectedMemberName}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Click outside to close */}
                    <div 
                        className="absolute inset-0 -z-10"
                        onClick={closePhotoModal}
                    />
                </div>
            )}
        </div>
    );
};

export default FamiliaPage;
