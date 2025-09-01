import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService, ResumeFile } from "@/services/twinApiService";
import ResumeAnalysisModal from "@/components/ResumeAnalysisModal";
import { 
    Upload,
    FileText,
    ArrowLeft,
    Briefcase,
    Award,
    Target,
    CheckCircle,
    AlertCircle,
    Loader2,
    Download,
    Trash2,
    Star,
    RefreshCw,
    User,
    Clock,
    BarChart3,
    Eye,
    FileBarChart
} from "lucide-react";

const CarreraProfesionalPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { accounts } = useMsal();
    
    // Estados para el manejo del CV/Resume
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');

    // Estados para la gestión de múltiples CVs
    const [resumeList, setResumeList] = useState<ResumeFile[]>([]);
    const [activeResume, setActiveResume] = useState<ResumeFile | null>(null);
    const [isLoadingResumes, setIsLoadingResumes] = useState(false);

    // Estados para el modal de análisis
    const [selectedResumeForAnalysis, setSelectedResumeForAnalysis] = useState<ResumeFile | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    // Get current user's twinId
    const getCurrentTwinId = () => {
        if (accounts.length > 0) {
            const account = accounts[0];
            return account.localAccountId;
        }
        return null;
    };

    // Función para cargar la lista de CVs
    const loadResumeList = async () => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        setIsLoadingResumes(true);
        try {
            console.log('📋 Cargando lista de CVs para twin:', twinId);
            const response = await twinApiService.getResumeList(twinId);
            
            if (response.success && response.data) {
                // Handle new enhanced response structure
                const resumeData = response.data;
                
                // Check if we have the new format
                if (resumeData.resumes && resumeData.totalResumes !== undefined) {
                    console.log('✅ Nueva estructura de CVs recibida:', resumeData.totalResumes, 'CVs procesados');
                    setResumeList(resumeData.resumes || []);
                    
                    // Find active resume from the list (if any)
                    const activeResume = resumeData.resumes?.find(resume => resume.isActive) || null;
                    setActiveResume(activeResume);
                } else {
                    // Legacy format support
                    console.log('📋 Formato legacy de CVs detectado');
                    setResumeList(resumeData.resumes || []);
                    setActiveResume(resumeData.activeResume || null);
                }
            } else {
                console.warn('⚠️ No se pudieron cargar los CVs:', response.error);
                setResumeList([]);
                setActiveResume(null);
            }
        } catch (error) {
            console.error('❌ Error cargando CVs:', error);
            setResumeList([]);
            setActiveResume(null);
        } finally {
            setIsLoadingResumes(false);
        }
    };

    // Función para establecer CV activo
    const handleSetActiveResume = async (fileName: string) => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        try {
            console.log('🎯 Estableciendo CV activo:', fileName);
            const response = await twinApiService.setActiveResume(twinId, fileName);
            
            if (response.success && response.data) {
                setActiveResume(response.data.activeResume);
                // Actualizar la lista para reflejar el cambio
                setResumeList(prev => prev.map(resume => ({
                    ...resume,
                    isActive: resume.fileName === fileName
                })));
                console.log('✅ CV activo establecido:', fileName);
            } else {
                console.warn('⚠️ Error estableciendo CV activo:', response.error);
            }
        } catch (error) {
            console.error('❌ Error estableciendo CV activo:', error);
        }
    };

    // Función para eliminar CV
    const handleDeleteResume = async (fileName: string) => {
        const twinId = getCurrentTwinId();
        if (!twinId) return;

        if (!confirm(`¿Estás seguro de que quieres eliminar "${fileName}"?`)) {
            return;
        }

        try {
            console.log('🗑️ Eliminando CV:', fileName);
            const response = await twinApiService.deleteResume(twinId, fileName);
            
            if (response.success) {
                // Recargar la lista
                await loadResumeList();
                console.log('✅ CV eliminado:', fileName);
            } else {
                console.warn('⚠️ Error eliminando CV:', response.error);
                alert('Error al eliminar el CV. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('❌ Error eliminando CV:', error);
            alert('Error al eliminar el CV. Por favor intenta de nuevo.');
        }
    };

    // Helper functions para formateo
    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return 'Fecha desconocida';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getResumeStatusText = (status: any) => {
        if (!status) return 'Sin procesar';
        if (status.isComplete) return 'Procesado';
        return 'Procesando...';
    };

    const getResumeStatusColor = (status: any) => {
        if (!status) return 'bg-gray-100 text-gray-600';
        if (status.isComplete) return 'bg-green-100 text-green-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    // Functions para el modal de análisis
    const openAnalysisModal = (resume: ResumeFile) => {
        console.log('Opening analysis modal for:', resume);
        setSelectedResumeForAnalysis(resume);
        setIsAnalysisModalOpen(true);
    };

    // Cargar lista de CVs al montar el componente
    useEffect(() => {
        loadResumeList();
    }, []);

    // Función para manejar la selección de archivo
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];
            
            if (allowedTypes.includes(file.type)) {
                setSelectedFile(file);
                setUploadStatus('idle');
                setUploadMessage('');
            } else {
                alert('Por favor selecciona un archivo válido (PDF, DOC, DOCX, TXT)');
                event.target.value = '';
            }
        }
    };

    // Función para subir el CV
    const handleUploadResume = async () => {
        if (!selectedFile) return;

        const twinId = getCurrentTwinId();
        if (!twinId) {
            setUploadStatus('error');
            setUploadMessage('Error: No se pudo obtener la identidad del usuario.');
            return;
        }

        setIsUploading(true);
        try {
            console.log('� Subiendo CV:', selectedFile.name, 'para twin:', twinId);
            
            // Generate custom filename with timestamp
            const fileExtension = selectedFile.name.split('.').pop();
            const customFileName = `resume_${new Date().toISOString().slice(0,10)}.${fileExtension}`;
            
            console.log('📝 Custom filename:', customFileName);
            
            // Call the API service
            const response = await twinApiService.uploadResume(twinId, selectedFile, customFileName);
            
            if (response.success && response.data) {
                setUploadStatus('success');
                setUploadMessage(`✅ CV subido exitosamente como "${response.data.fileName}". ¡Listo para procesar con AI!`);
                console.log('🎉 Resume uploaded successfully:', response.data);
                
                // Reload the resume list after successful upload
                await loadResumeList();
                
                // Clear the selected file
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                throw new Error(response.error || 'Error desconocido al subir el CV');
            }
            
        } catch (error) {
            console.error('❌ Error subiendo CV:', error);
            setUploadStatus('error');
            
            let errorMessage = 'Error al subir el CV. Por favor intenta de nuevo.';
            if (error instanceof Error) {
                if (error.message.includes('Invalid file type')) {
                    errorMessage = 'Formato de archivo no válido. Use PDF, DOC, DOCX o TXT.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
            }
            
            setUploadMessage(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    // Función para abrir el selector de archivos
    const openFileSelector = () => {
        fileInputRef.current?.click();
    };

    // Función para eliminar archivo seleccionado
    const removeSelectedFile = () => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Formatear tamaño de archivo - actualizado
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
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
                                    <Briefcase className="text-purple-600" size={40} />
                                    Carrera Profesional
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Gestiona tu historial laboral, empresas, sueldos y crecimiento profesional
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Principal: Subir CV/Resume */}
                <div className="grid gap-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <FileText className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Subir CV/Resume</h2>
                                <p className="text-gray-600">
                                    Sube tu currículum para generar automáticamente tu historial profesional con AI
                                </p>
                            </div>
                        </div>

                        {/* Área de Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                            {!selectedFile ? (
                                <div>
                                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Arrastra tu CV aquí o haz clic para seleccionar
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Formatos soportados: PDF, DOC, DOCX, TXT (máximo 10MB)
                                    </p>
                                    <Button
                                        onClick={openFileSelector}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Upload size={16} className="mr-2" />
                                        Seleccionar Archivo
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <FileText className="mx-auto text-purple-600 mb-4" size={48} />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {selectedFile.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Tamaño: {formatFileSize(selectedFile.size)}
                                    </p>
                                    
                                    {uploadStatus === 'idle' && (
                                        <div className="flex gap-3 justify-center">
                                            <Button
                                                onClick={handleUploadResume}
                                                disabled={isUploading}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                                        Subiendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={16} className="mr-2" />
                                                        Subir CV
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={removeSelectedFile}
                                                variant="outline"
                                                disabled={isUploading}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}

                                    {uploadStatus === 'success' && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 text-green-800">
                                                <CheckCircle size={16} />
                                                <span className="font-medium">{uploadMessage}</span>
                                            </div>
                                        </div>
                                    )}

                                    {uploadStatus === 'error' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-center gap-2 text-red-800">
                                                <AlertCircle size={16} />
                                                <span className="font-medium">{uploadMessage}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Información adicional */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <Target className="text-blue-600" size={16} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-900 mb-1">
                                        ¿Qué haremos con tu CV?
                                    </h4>
                                    <ul className="text-blue-800 text-sm space-y-1">
                                        <li>• Extraer tu historial laboral automáticamente</li>
                                        <li>• Identificar empresas, cargos y fechas</li>
                                        <li>• Organizar tu experiencia profesional</li>
                                        <li>• Crear tu línea de tiempo de carrera</li>
                                        <li>• Analizar tu crecimiento profesional</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header de Portfolio de CVs - Siempre visible */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <FileBarChart className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Portfolio de CVs/Resumés</h2>
                                    <p className="text-gray-600">
                                        Gestiona y analiza tus currículums con inteligencia artificial
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={loadResumeList}
                                    variant="outline"
                                    disabled={isLoadingResumes}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw size={16} className={isLoadingResumes ? 'animate-spin' : ''} />
                                    {isLoadingResumes ? 'Cargando...' : 'Actualizar'}
                                </Button>
                            </div>
                        </div>

                        {/* Estadísticas de Portfolio */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-blue-600" size={20} />
                                    <div>
                                        <p className="text-blue-900 font-semibold text-lg">{resumeList.length}</p>
                                        <p className="text-blue-700 text-sm">CVs Subidos</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Star className="text-green-600" size={20} />
                                    <div>
                                        <p className="text-green-900 font-semibold text-lg">{activeResume ? '1' : '0'}</p>
                                        <p className="text-green-700 text-sm">CV Activo</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="text-purple-600" size={20} />
                                    <div>
                                        <p className="text-purple-900 font-semibold text-lg">
                                            {resumeList.filter(r => r.status?.isComplete).length}
                                        </p>
                                        <p className="text-purple-700 text-sm">Procesados</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Award className="text-orange-600" size={20} />
                                    <div>
                                        <p className="text-orange-900 font-semibold text-lg">
                                            {resumeList.reduce((total, r) => total + (r.stats?.skills || r.totalSkills || 0), 0)}
                                        </p>
                                        <p className="text-orange-700 text-sm">Skills Totales</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estado de carga */}
                        {isLoadingResumes && (
                            <div className="text-center py-12">
                                <Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={48} />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando CVs...</h3>
                                <p className="text-gray-600">Obteniendo tu portfolio desde el servidor</p>
                            </div>
                        )}

                        {/* Mensaje si no hay CVs */}
                        {!isLoadingResumes && resumeList.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay CVs subidos</h3>
                                <p className="text-gray-600 mb-4">
                                    Sube tu primer currículum para comenzar a construir tu portfolio profesional
                                </p>
                                <Button
                                    onClick={openFileSelector}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Upload size={16} className="mr-2" />
                                    Subir mi primer CV
                                </Button>
                            </div>
                        )}

                        {/* Grid de CVs - Solo se muestra si hay CVs */}
                        {!isLoadingResumes && resumeList.length > 0 && (
                            <>
                                {/* Título de la sección con filtros mejorados */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Portfolio de CVs
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {resumeList.length} currículum{resumeList.length !== 1 ? 's' : ''} en total
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        {/* Indicadores de estado */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span>CV Activo</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span>Procesado</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <span>Procesando</span>
                                            </div>
                                        </div>
                                        
                                        {/* Botón de refresh más prominente */}
                                        <Button
                                            onClick={loadResumeList}
                                            variant="outline"
                                            disabled={isLoadingResumes}
                                            className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                                        >
                                            <RefreshCw size={16} className={isLoadingResumes ? 'animate-spin' : ''} />
                                            {isLoadingResumes ? 'Actualizando...' : 'Refresh CVs'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Grid de CVs modernizado */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {resumeList.map((resume, index) => (
                                        <div 
                                            key={resume.documentId || resume.fileName || resume.id || `resume-${index}`}
                                            className={`relative border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                                                resume.isActive 
                                                    ? 'border-green-400 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-lg ring-2 ring-green-200' 
                                                    : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-xl hover:ring-2 hover:ring-purple-100'
                                            }`}
                                            onClick={() => openAnalysisModal(resume)}
                                        >
                                            {/* Badge de estado activo flotante */}
                                            {resume.isActive && (
                                                <div className="absolute -top-2 -right-2 z-10">
                                                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                                        <Star size={10} className="fill-current" />
                                                        ACTIVO
                                                    </div>
                                                </div>
                                            )}

                                            {/* Header de la tarjeta mejorado */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`p-3 rounded-xl ${
                                                        resume.isActive 
                                                            ? 'bg-green-500 text-white shadow-md' 
                                                            : 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700'
                                                    }`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-base mb-1 truncate">
                                                            {(resume.fileName || 'CV sin nombre').replace(/\.[^/.]+$/, "")}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Clock size={12} />
                                                            <span>{formatTimeAgo(resume.uploadedAt || resume.uploadTime || '')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Status indicator más prominente */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getResumeStatusColor(resume.status)}`}>
                                                        {getResumeStatusText(resume.status)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Información Personal Mejorada */}
                                            {(resume.personalInfo || resume.fullName || resume.email || resume.currentJobTitle) && (
                                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-5 border border-blue-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <User size={16} className="text-blue-600" />
                                                        <span className="text-sm font-semibold text-blue-900">Información Extraída</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(resume.personalInfo?.fullName || resume.fullName) && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                                <span className="font-medium text-gray-900 text-sm">
                                                                    {resume.personalInfo?.fullName || resume.fullName}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {(resume.personalInfo?.currentPosition || resume.currentJobTitle) && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                                <span className="text-gray-700 text-sm truncate">
                                                                    {resume.personalInfo?.currentPosition || resume.currentJobTitle}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {(resume.personalInfo?.email || resume.email) && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                                <span className="text-gray-700 text-sm truncate">
                                                                    {resume.personalInfo?.email || resume.email}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Estadísticas Mejoradas */}
                                            {(resume.stats || resume.totalWorkExperience !== undefined || resume.totalEducation !== undefined || resume.totalSkills !== undefined) && (
                                                <div className="grid grid-cols-3 gap-3 mb-5">
                                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white text-center shadow-md">
                                                        <div className="text-xl font-bold">
                                                            {resume.stats?.workExperience || resume.totalWorkExperience || 0}
                                                        </div>
                                                        <div className="text-xs opacity-90">Trabajos</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white text-center shadow-md">
                                                        <div className="text-xl font-bold">
                                                            {resume.stats?.education || resume.totalEducation || 0}
                                                        </div>
                                                        <div className="text-xs opacity-90">Educación</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white text-center shadow-md">
                                                        <div className="text-xl font-bold">
                                                            {resume.stats?.skills || resume.totalSkills || 0}
                                                        </div>
                                                        <div className="text-xs opacity-90">Skills</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Top Skills Mejoradas */}
                                            {((resume.topSkills && Array.isArray(resume.topSkills) && resume.topSkills.length > 0) || 
                                              (resume.skillsList && Array.isArray(resume.skillsList) && resume.skillsList.length > 0)) && (
                                                <div className="mb-5">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Award size={16} className="text-orange-600" />
                                                        <span className="text-sm font-semibold text-gray-900">Top Skills</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(resume.topSkills || resume.skillsList || []).slice(0, 3).map((skill, skillIndex) => (
                                                            <span 
                                                                key={skillIndex}
                                                                className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm"
                                                            >
                                                                {skill || `Skill ${skillIndex + 1}`}
                                                            </span>
                                                        ))}
                                                        {(resume.topSkills || resume.skillsList || []).length > 3 && (
                                                            <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm">
                                                                +{(resume.topSkills || resume.skillsList || []).length - 3} más
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Botones de Acción Mejorados */}
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {!resume.isActive && (
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (resume.fileName) {
                                                                        handleSetActiveResume(resume.fileName);
                                                                    }
                                                                }}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs px-3 py-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all"
                                                            >
                                                                <Star size={12} className="mr-1" />
                                                                Activar
                                                            </Button>
                                                        )}
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openAnalysisModal(resume);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs px-3 py-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                                                        >
                                                            <Eye size={12} className="mr-1" />
                                                            Ver Análisis
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            onClick={(e) => e.stopPropagation()}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs px-2 py-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
                                                        >
                                                            <Download size={12} />
                                                        </Button>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (resume.fileName) {
                                                                    handleDeleteResume(resume.fileName);
                                                                }
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs px-2 py-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all"
                                                            disabled={resume.isActive}
                                                        >
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Resume Analysis Modal */}
            <ResumeAnalysisModal
                resume={selectedResumeForAnalysis}
                isOpen={isAnalysisModalOpen}
                onClose={() => {
                    setIsAnalysisModalOpen(false);
                    setSelectedResumeForAnalysis(null);
                }}
            />
        </div>
    );
};

export default CarreraProfesionalPage;
