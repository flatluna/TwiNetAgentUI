import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService, Education, EducationDocument } from "@/services/twinApiService";
import { documentApiService } from "@/services/documentApiService";
import EducationDocumentViewerModal from "@/components/EducationDocumentViewerModal";
import { 
    Plus, 
    Edit3, 
    Trash2, 
    GraduationCap, 
    Calendar,
    MapPin,
    X,
    Save,
    BookOpen,
    Search,
    Award,
    School,
    University,
    FileText,
    Star,
    Clock,
    CheckCircle,
    Building,
    Users,
    ArrowLeft,
    RefreshCw,
    Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EducationFormData {
    institution: string;
    education_type: 'primaria' | 'secundaria' | 'preparatoria' | 'universidad' | 'posgrado' | 'certificacion' | 'diploma' | 'curso' | 'otro';
    degree_obtained: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
    in_progress: boolean;
    country: string;
    description: string;
    achievements: string;
    gpa: string;
    credits: number;
}

// Lista de los 40 países más grandes del mundo
const countries = [
    'Estados Unidos', 'China', 'Japón', 'Alemania', 'Reino Unido', 'Francia', 'India', 'Italia', 'Brasil', 'Canadá',
    'Rusia', 'Corea del Sur', 'España', 'Australia', 'México', 'Indonesia', 'Países Bajos', 'Arabia Saudí', 'Turquía', 'Taiwán',
    'Bélgica', 'Argentina', 'Irlanda', 'Israel', 'Austria', 'Nigeria', 'Noruega', 'Emiratos Árabes Unidos', 'Egipto', 'Sudáfrica',
    'Filipinas', 'Bangladesh', 'Chile', 'Finlandia', 'Rumania', 'República Checa', 'Nueva Zelanda', 'Perú', 'Vietnam', 'Grecia'
];

const EducacionPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();
    const [education, setEducation] = useState<Education[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingEducationId, setDeletingEducationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('todos');
    const [uploadingEducationId, setUploadingEducationId] = useState<string | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<EducationDocument | null>(null);
    const [showEducationDocumentModal, setShowEducationDocumentModal] = useState(false);

    // Tipos de educación disponibles
    const educationTypes = [
        { id: 'todos', label: 'Todos los estudios', icon: BookOpen, color: 'bg-gray-500', bgLight: 'bg-gray-100' },
        { id: 'primaria', label: 'Primaria', icon: School, color: 'bg-green-500', bgLight: 'bg-green-100' },
        { id: 'secundaria', label: 'Secundaria', icon: School, color: 'bg-blue-500', bgLight: 'bg-blue-100' },
        { id: 'preparatoria', label: 'Preparatoria', icon: GraduationCap, color: 'bg-purple-500', bgLight: 'bg-purple-100' },
        { id: 'universidad', label: 'Universidad', icon: University, color: 'bg-indigo-500', bgLight: 'bg-indigo-100' },
        { id: 'posgrado', label: 'Posgrado', icon: Award, color: 'bg-red-500', bgLight: 'bg-red-100' },
        { id: 'certificacion', label: 'Certificación', icon: Award, color: 'bg-yellow-500', bgLight: 'bg-yellow-100' },
        { id: 'diploma', label: 'Diploma', icon: FileText, color: 'bg-teal-500', bgLight: 'bg-teal-100' },
        { id: 'curso', label: 'Curso', icon: BookOpen, color: 'bg-orange-500', bgLight: 'bg-orange-100' },
        { id: 'otro', label: 'Otro', icon: Star, color: 'bg-pink-500', bgLight: 'bg-pink-100' }
    ];

    // Campos de estudio comunes
    const commonFields = [
        'No aplica',
        'Administración de Empresas',
        'Ingeniería de Sistemas',
        'Ingeniería Civil',
        'Medicina',
        'Derecho',
        'Psicología',
        'Educación',
        'Arquitectura',
        'Contaduría',
        'Marketing',
        'Diseño Gráfico',
        'Comunicación Social',
        'Enfermería',
        'Economía',
        'Ciencias Sociales',
        'Matemáticas',
        'Física',
        'Química',
        'Biología',
        'Historia',
        'Literatura',
        'Idiomas',
        'Arte',
        'Música',
        'Deportes',
        'Tecnología',
        'Programación',
        'Ciencias de la Computación',
        'Otro'
    ];

    const [formData, setFormData] = useState<EducationFormData>({
        institution: '',
        education_type: 'universidad',
        degree_obtained: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        in_progress: false,
        country: '',
        description: '',
        achievements: '',
        gpa: '',
        credits: 0
    });

    // Get Twin ID from authentication
    const getTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    // Load education on component mount
    useEffect(() => {
        loadEducation();
    }, []);

    // Debug: Track education state changes
    useEffect(() => {
        console.log('🔍 Education state changed:', education);
        console.log('🔍 Education array length:', education?.length || 0);
    }, [education]);

    const loadEducation = async () => {
        const twinId = getTwinId();
        console.log('🔍 Loading education for twinId:', twinId);
        
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setIsLoading(true);
        try {
            const response = await twinApiService.getEducation(twinId);
            console.log('🔍 Raw API response:', response);
            
            if (response.success && response.data) {
                // Ensure data is always an array
                const educationArray = Array.isArray(response.data) ? response.data : [];
                console.log('🔍 Education array to set:', educationArray);
                setEducation(educationArray);
            } else {
                console.error('Error loading education:', response.error);
                setEducation([]);
            }
        } catch (error) {
            console.error('Error loading education:', error);
            setEducation([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh education
    const refreshEducation = async () => {
        console.log('🔄 Refreshing education...');
        await loadEducation();
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            institution: '',
            education_type: 'universidad',
            degree_obtained: '',
            field_of_study: '',
            start_date: '',
            end_date: '',
            in_progress: false,
            country: '',
            description: '',
            achievements: '',
            gpa: '',
            credits: 0
        });
    };

    // Function to map EducationFormData to EducationData (frontend to backend)
    const mapFormDataToEducationData = (formData: EducationFormData): any => {
        console.log('🔧 Mapping form data:', formData);
        
        // Map to exact .NET backend property names (PascalCase)
        const mappedData = {
            Institution: formData.institution,
            EducationType: formData.education_type,
            DegreeObtained: formData.degree_obtained || '',
            FieldOfStudy: formData.field_of_study || '',
            StartDate: formData.start_date,
            EndDate: formData.end_date || '',
            InProgress: formData.in_progress,
            Country: formData.country || '',
            Description: formData.description || '',
            Achievements: formData.achievements || '',
            Gpa: formData.gpa || '',
            Credits: formData.credits || 0,
            Type: 'education'
        };
        
        console.log('🔧 Mapped data result (.NET PascalCase):', mappedData);
        return mappedData;
    };

    // Handle create education
    const handleCreateEducation = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        if (!formData.institution.trim()) {
            alert('La institución es obligatoria');
            return;
        }

        setIsLoading(true);
        try {
            // Debug: Log form data before mapping
            console.log('🔍 Form data before mapping:', formData);
            
            // Map form data to backend format
            const educationData = mapFormDataToEducationData(formData);
            console.log('🔄 Creating education with data:', educationData);
            
            const response = await twinApiService.createEducation(twinId, educationData);
            console.log('✅ Create response:', response);
            
            if (response.success && response.data) {
                console.log('✅ Education created successfully');
                alert('Registro educativo creado correctamente');
                
                // Recargar la lista de educación para asegurar que esté sincronizada
                await refreshEducation();
                
                // Reset form but keep modal open for user to decide
                resetForm();
            } else {
                console.error('❌ Error creating education:', response.error);
                alert('Error al crear el registro educativo: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('❌ Error creating education:', error);
            alert('Error al crear el registro educativo. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit education
    const handleEditEducation = (eduItem: Education) => {
        setEditingEducation(eduItem);
        setFormData({
            institution: eduItem.institution,
            education_type: eduItem.education_type,
            degree_obtained: eduItem.degree_obtained || '',
            field_of_study: eduItem.field_of_study || '',
            start_date: eduItem.start_date,
            end_date: eduItem.end_date || '',
            in_progress: eduItem.in_progress,
            country: eduItem.country || '',
            description: eduItem.description || '',
            achievements: eduItem.achievements || '',
            gpa: eduItem.gpa || '',
            credits: eduItem.credits || 0
        });
        setShowEditModal(true);
    };

    // Handle update education
    const handleUpdateEducation = async () => {
        if (!editingEducation) return;

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        if (!formData.institution.trim()) {
            alert('La institución es obligatoria');
            return;
        }

        setIsLoading(true);
        try {
            // Map form data to backend format
            const educationData = mapFormDataToEducationData(formData);
            console.log('🔄 Updating education with data:', educationData);
            
            const response = await twinApiService.updateEducation(twinId, getEducationId(editingEducation), educationData);
            console.log('✅ Update response:', response);
            
            if (response.success && response.data) {
                console.log('✅ Education updated successfully');
                alert('Registro educativo actualizado correctamente');
                
                // Recargar la lista de educación para asegurar que esté sincronizada
                await refreshEducation();
            } else {
                console.error('❌ Error updating education:', response.error);
                alert('Error al actualizar el registro educativo: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('❌ Error updating education:', error);
            alert('Error al actualizar el registro educativo. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete education
    const handleDeleteEducation = async (educationId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este registro educativo?')) {
            return;
        }

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setDeletingEducationId(educationId);
        try {
            const response = await twinApiService.deleteEducation(twinId, educationId);
            if (response.success) {
                setEducation(prev => prev.filter(e => getEducationId(e) !== educationId));
                console.log('Education deleted successfully');
            } else {
                console.error('Error deleting education:', response.error);
                alert('Error al eliminar el registro educativo: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error deleting education:', error);
            alert('Error al eliminar el registro educativo. Por favor, inténtelo de nuevo.');
        } finally {
            setDeletingEducationId(null);
        }
    };

    // Handle PDF upload for education
    const handleUploadPDF = async (educationId: string, file: File) => {
        console.log('📁 Uploading PDF for education record:', educationId, 'File:', file.name);
        console.log('📋 Education ID (Cosmos DB record):', educationId);
        
        const twinId = getTwinId();
        if (!twinId) {
            alert('No se encontró el ID del Twin');
            return;
        }

        console.log('👤 Twin ID:', twinId);

        setUploadingEducationId(educationId);
        try {
            // Use the real document service to upload education document
            const result = await documentApiService.uploadEducationDocument(twinId, educationId, file);
            
            console.log('✅ Upload successful:', result);
            alert(`Archivo ${file.name} subido exitosamente para la educación`);
            
        } catch (error) {
            console.error('Error uploading PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error al subir el archivo: ${errorMessage}`);
        } finally {
            setUploadingEducationId(null);
        }
    };

    // Handle file input change
    const handleFileInputChange = (educationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleUploadPDF(educationId, file);
        }
        // Reset input value to allow uploading the same file again
        event.target.value = '';
    };

    // Handle viewing document details
    const handleViewDocument = (document: EducationDocument) => {
        console.log('👁️ Viewing document:', document);
        setSelectedDocument(document);
        setShowEducationDocumentModal(true);
    };

    // Close education document modal
    const closeEducationDocumentModal = () => {
        setShowEducationDocumentModal(false);
        setSelectedDocument(null);
    };

    // Filter education
    const filteredEducation = (education || []).filter(eduItem => {
        console.log('🔍 Individual education item structure:', eduItem);
        console.log('🔍 Documents in this education item:', eduItem.documents);
        
        const matchesSearch = 
            (eduItem.institution || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (eduItem.degree_obtained && eduItem.degree_obtained.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (eduItem.field_of_study && eduItem.field_of_study.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (eduItem.country && eduItem.country.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === 'todos' || eduItem.education_type === selectedType;
        
        return matchesSearch && matchesType;
    });

    console.log('🔍 Filtered education results:', filteredEducation);
    console.log('🔍 Filtered education length:', filteredEducation.length);

    // Get education type info
    const getEducationTypeInfo = (type: string) => {
        return educationTypes.find(t => t.id === type) || educationTypes[0];
    };

    // Get education ID (handles both id and education_id fields)
    const getEducationId = (eduItem: Education): string => {
        return eduItem.id || eduItem.education_id || '';
    };

    // Get education display title
    const getEducationDisplayTitle = (eduItem: Education) => {
        if (eduItem.degree_obtained) {
            return eduItem.degree_obtained;
        }
        return `${getEducationTypeInfo(eduItem.education_type).label} en ${eduItem.institution}`;
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long' 
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => navigate('/twin-biografia')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                        <GraduationCap className="h-8 w-8 text-white" />
                                    </div>
                                    Mi Educación
                                </h1>
                                <p className="text-gray-600">Administra tu historial académico y certificaciones</p>
                            </div>
                        </div>
                        <Button
                            onClick={refreshEducation}
                            disabled={isLoading}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por institución, título, campo de estudio..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Add Education Button */}
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                        >
                            <Plus className="mr-2" size={20} />
                            Agregar Educación
                        </Button>
                    </div>

                    {/* Education Type Filters */}
                    <div className="flex flex-wrap gap-2">
                        {educationTypes.map(type => {
                            const isSelected = selectedType === type.id;
                            const Icon = type.icon;
                            const educationCount = type.id === 'todos' 
                                ? (education || []).length 
                                : (education || []).filter(e => e.education_type === type.id).length;

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        isSelected
                                            ? `${type.color} text-white border-transparent shadow-md`
                                            : `bg-white text-gray-700 border-gray-300 hover:${type.bgLight}`
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span className="text-sm font-medium">{type.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        isSelected ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {educationCount}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Education Timeline */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Cargando educación...</span>
                    </div>
                ) : filteredEducation.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto mb-4 p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                            <GraduationCap className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm || selectedType !== 'todos' 
                                ? 'No se encontraron registros educativos' 
                                : 'No tienes registros educativos aún'
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedType !== 'todos'
                                ? 'Intenta cambiar los filtros de búsqueda'
                                : 'Comienza agregando tu primer registro educativo'
                            }
                        </p>
                        {(!searchTerm && selectedType === 'todos') && (
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Plus className="mr-2" size={20} />
                                Agregar Primera Educación
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Sort education by start date (most recent first) */}
                        {filteredEducation
                            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                            .map((eduItem, index) => {
                                const typeInfo = getEducationTypeInfo(eduItem.education_type);
                                const TypeIcon = typeInfo.icon;
                                
                                console.log('🎯 RENDERING EDUCATION ITEM - Documents:', {
                                    id: getEducationId(eduItem),
                                    hasDocuments: eduItem.documents && eduItem.documents.length > 0,
                                    documentsCount: eduItem.documents?.length || 0
                                });
                                
                                return (
                                    <div key={getEducationId(eduItem)} className="relative">
                                        {/* Timeline connector */}
                                        {index < filteredEducation.length - 1 && (
                                            <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
                                        )}
                                        
                                        {/* Education Card */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ml-14">
                                            {/* Timeline dot */}
                                            <div className={`absolute left-4 top-6 w-4 h-4 rounded-full ${typeInfo.color} border-4 border-white shadow-md`}></div>
                                            
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={`p-3 rounded-lg ${typeInfo.bgLight}`}>
                                                        <TypeIcon className={`w-6 h-6 text-gray-700`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                                                            {getEducationDisplayTitle(eduItem)}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                            <Building className="w-4 h-4" />
                                                            {eduItem.institution}
                                                        </div>
                                                        
                                                        {/* Education Type Badge */}
                                                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color} text-white mb-3`}>
                                                            <TypeIcon size={14} />
                                                            {typeInfo.label}
                                                        </div>
                                                        
                                                        {/* Dates and Status */}
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>
                                                                    {formatDate(eduItem.start_date)}
                                                                    {eduItem.in_progress ? 
                                                                        ' - Presente' : 
                                                                        (eduItem.end_date ? ` - ${formatDate(eduItem.end_date)}` : '')
                                                                    }
                                                                </span>
                                                            </div>
                                                            {eduItem.in_progress && (
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span className="font-medium">En progreso</span>
                                                                </div>
                                                            )}
                                                            {!eduItem.in_progress && eduItem.end_date && (
                                                                <div className="flex items-center gap-1 text-blue-600">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    <span className="font-medium">Completado</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Additional Info */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            {eduItem.field_of_study && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <BookOpen size={14} />
                                                                    <span><strong>Campo:</strong> {eduItem.field_of_study}</span>
                                                                </div>
                                                            )}
                                                            {eduItem.country && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <MapPin size={14} />
                                                                    <span>
                                                                        <strong>País:</strong> {eduItem.country}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {eduItem.gpa && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Star size={14} />
                                                                    <span><strong>Promedio:</strong> {eduItem.gpa}</span>
                                                                </div>
                                                            )}
                                                            {eduItem.credits && eduItem.credits > 0 && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Users size={14} />
                                                                    <span><strong>Créditos:</strong> {eduItem.credits}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Description */}
                                                        {eduItem.description && eduItem.description.trim() && !/^\d+$/.test(eduItem.description.trim()) && (
                                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                <p className="text-sm text-gray-600">{eduItem.description}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Achievements */}
                                                        {eduItem.achievements && (
                                                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Award className="w-4 h-4 text-yellow-600" />
                                                                    <span className="font-medium text-yellow-800">Logros Destacados</span>
                                                                </div>
                                                                <p className="text-sm text-yellow-700">{eduItem.achievements}</p>
                                                            </div>
                                                        )}

                                                        {/* Documents Section */}
                                                        {eduItem.documents && eduItem.documents.length > 0 && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm font-medium text-blue-800">
                                                                        📎 {eduItem.documents?.length || 0} document{(eduItem.documents?.length || 0) > 1 ? 's' : ''} attached
                                                                    </span>
                                                                </div>
                                                                <div className="w-full">
                                                                    <select
                                                                        onChange={(e) => {
                                                                            console.log('📝 SELECT CHANGED:', e.target.value);
                                                                            const selectedIndex = parseInt(e.target.value);
                                                                            if (selectedIndex >= 0 && eduItem.documents) {
                                                                                console.log('📄 Opening document:', eduItem.documents[selectedIndex]);
                                                                                handleViewDocument(eduItem.documents[selectedIndex]);
                                                                            }
                                                                            // Reset selection
                                                                            e.target.value = "";
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                                                        defaultValue=""
                                                                    >
                                                                        <option value="" disabled>
                                                                            Select a document to view...
                                                                        </option>
                                                                        {eduItem.documents?.map((doc: EducationDocument, docIndex: number) => (
                                                                            <option key={doc.documentId || docIndex} value={docIndex}>
                                                                                📄 {doc.fileName || `Document ${docIndex + 1}`}
                                                                                {doc.processedAt && ` (${new Date(doc.processedAt).toLocaleDateString('es-ES')})`}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex gap-1">
                                                    {/* Upload PDF Button */}
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={(e) => handleFileInputChange(getEducationId(eduItem), e)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            disabled={uploadingEducationId === getEducationId(eduItem)}
                                                        />
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Subir documento PDF"
                                                            disabled={uploadingEducationId === getEducationId(eduItem)}
                                                        >
                                                            {uploadingEducationId === getEducationId(eduItem) ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                            ) : (
                                                                <Upload size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => handleEditEducation(eduItem)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar registro educativo"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEducation(getEducationId(eduItem))}
                                                        disabled={deletingEducationId === getEducationId(eduItem)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Eliminar registro educativo"
                                                    >
                                                        {deletingEducationId === getEducationId(eduItem) ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* Modal para crear educación */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                            <GraduationCap className="h-6 w-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800">Agregar Educación</h2>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form className="space-y-6">
                                    {/* Información básica */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Institución *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.institution}
                                                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Universidad, colegio, instituto..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tipo de Educación *</label>
                                            <select
                                                required
                                                value={formData.education_type}
                                                onChange={(e) => setFormData({...formData, education_type: e.target.value as any})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {educationTypes.slice(1).map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Título Obtenido</label>
                                            <input
                                                type="text"
                                                value={formData.degree_obtained}
                                                onChange={(e) => setFormData({...formData, degree_obtained: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Licenciatura en..., Certificado en..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Campo de Estudio</label>
                                            <select
                                                value={formData.field_of_study}
                                                onChange={(e) => setFormData({...formData, field_of_study: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar campo...</option>
                                                {commonFields.map(field => (
                                                    <option key={field} value={field}>
                                                        {field}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha de Finalización</label>
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                                disabled={formData.in_progress}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="flex items-center gap-2 mt-6">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.in_progress}
                                                    onChange={(e) => setFormData({...formData, in_progress: e.target.checked, end_date: e.target.checked ? '' : formData.end_date})}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium">En progreso</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">País</label>
                                        <select
                                            value={formData.country}
                                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar país...</option>
                                            {countries.map(country => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Información académica adicional */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Promedio/Calificación</label>
                                            <input
                                                type="text"
                                                value={formData.gpa}
                                                onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="9.5, A+, Cum Laude..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Créditos</label>
                                            <input
                                                type="number"
                                                value={formData.credits}
                                                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Número de créditos"
                                            />
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe tu experiencia educativa, materias principales, proyectos..."
                                        />
                                    </div>

                                    {/* Logros */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Logros Destacados</label>
                                        <textarea
                                            value={formData.achievements}
                                            onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Reconocimientos, premios, menciones honoríficas, becas..."
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleCreateEducation}
                                            disabled={isLoading || !formData.institution.trim()}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Creando...
                                                </>
                                            ) : (
                                                <>
                                                    <GraduationCap className="mr-2" size={16} />
                                                    Crear Registro
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            disabled={isLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <X className="mr-2" size={16} />
                                            Cerrar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para editar educación */}
                {showEditModal && editingEducation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                            <Edit3 className="h-6 w-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800">Editar Educación</h2>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingEducation(null);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form className="space-y-6">
                                    {/* Información básica */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Institución *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.institution}
                                                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Universidad, colegio, instituto..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Tipo de Educación *</label>
                                            <select
                                                required
                                                value={formData.education_type}
                                                onChange={(e) => setFormData({...formData, education_type: e.target.value as any})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {educationTypes.slice(1).map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Título Obtenido</label>
                                            <input
                                                type="text"
                                                value={formData.degree_obtained}
                                                onChange={(e) => setFormData({...formData, degree_obtained: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Licenciatura en..., Certificado en..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Campo de Estudio</label>
                                            <select
                                                value={formData.field_of_study}
                                                onChange={(e) => setFormData({...formData, field_of_study: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar campo...</option>
                                                {commonFields.map(field => (
                                                    <option key={field} value={field}>
                                                        {field}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fecha de Finalización</label>
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                                disabled={formData.in_progress}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="flex items-center gap-2 mt-6">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.in_progress}
                                                    onChange={(e) => setFormData({...formData, in_progress: e.target.checked, end_date: e.target.checked ? '' : formData.end_date})}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium">En progreso</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">País</label>
                                        <select
                                            value={formData.country}
                                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Seleccionar país...</option>
                                            {countries.map(country => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Información académica adicional */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Promedio/Calificación</label>
                                            <input
                                                type="text"
                                                value={formData.gpa}
                                                onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="9.5, A+, Cum Laude..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Créditos</label>
                                            <input
                                                type="number"
                                                value={formData.credits}
                                                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Número de créditos"
                                            />
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe tu experiencia educativa, materias principales, proyectos..."
                                        />
                                    </div>

                                    {/* Logros */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Logros Destacados</label>
                                        <textarea
                                            value={formData.achievements}
                                            onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Reconocimientos, premios, menciones honoríficas, becas..."
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setEditingEducation(null);
                                                resetForm();
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleUpdateEducation}
                                            disabled={isLoading || !formData.institution.trim()}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Actualizando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2" size={16} />
                                                    Actualizar Registro
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setEditingEducation(null);
                                                resetForm();
                                            }}
                                            disabled={isLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <X className="mr-2" size={16} />
                                            Cerrar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Education Document Viewer Modal */}
                <EducationDocumentViewerModal
                    isOpen={showEducationDocumentModal}
                    onClose={closeEducationDocumentModal}
                    document={selectedDocument}
                />
            </div>
        </div>
    );
};

export default EducacionPage;
