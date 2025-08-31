import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    Upload,
    FileText,
    ArrowLeft,
    Briefcase,
    Building,
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    Award,
    Target,
    CheckCircle,
    AlertCircle,
    Loader2
} from "lucide-react";

const CarreraProfesionalPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Estados para el manejo del CV/Resume
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');

    // Función para manejar la selección de archivo
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (allowedTypes.includes(file.type)) {
                setSelectedFile(file);
                setUploadStatus('idle');
                setUploadMessage('');
            } else {
                alert('Por favor selecciona un archivo PDF o Word (.pdf, .doc, .docx)');
                event.target.value = '';
            }
        }
    };

    // Función para subir el CV
    const handleUploadResume = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            // TODO: Implementar la llamada al API para subir el CV
            console.log('📄 Subiendo CV:', selectedFile.name);
            
            // Simulación de upload por ahora
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setUploadStatus('success');
            setUploadMessage('CV subido exitosamente. ¡Listo para procesar con AI!');
            
        } catch (error) {
            console.error('❌ Error subiendo CV:', error);
            setUploadStatus('error');
            setUploadMessage('Error al subir el CV. Por favor intenta de nuevo.');
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

    // Formatear tamaño de archivo
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
                                        Formatos soportados: PDF, DOC, DOCX (máximo 10MB)
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
                                accept=".pdf,.doc,.docx"
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

                    {/* Cards de Funcionalidades Futuras */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Historial Laboral */}
                        <div className="bg-white rounded-xl shadow-lg p-6 opacity-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Calendar className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Historial Laboral</h3>
                                    <p className="text-gray-600 text-sm">Cronología de empleos</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Línea de tiempo completa de tu carrera profesional con fechas, cargos y responsabilidades.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Próximamente
                                </span>
                            </div>
                        </div>

                        {/* Empresas */}
                        <div className="bg-white rounded-xl shadow-lg p-6 opacity-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Building className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Empresas</h3>
                                    <p className="text-gray-600 text-sm">Organizaciones donde trabajaste</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Información detallada de cada empresa, sectores, tamaños y tu rol en cada una.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Próximamente
                                </span>
                            </div>
                        </div>

                        {/* Sueldos y Compensación */}
                        <div className="bg-white rounded-xl shadow-lg p-6 opacity-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                    <DollarSign className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Sueldos</h3>
                                    <p className="text-gray-600 text-sm">Evolución salarial</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Tracking de tu crecimiento salarial, beneficios y compensaciones a lo largo del tiempo.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Próximamente
                                </span>
                            </div>
                        </div>

                        {/* Crecimiento Profesional */}
                        <div className="bg-white rounded-xl shadow-lg p-6 opacity-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <TrendingUp className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Crecimiento</h3>
                                    <p className="text-gray-600 text-sm">Análisis de progreso</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Métricas y análisis de tu desarrollo profesional, promociones y cambios de carrera.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Próximamente
                                </span>
                            </div>
                        </div>

                        {/* Habilidades y Competencias */}
                        <div className="bg-white rounded-xl shadow-lg p-6 opacity-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                    <Award className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Habilidades</h3>
                                    <p className="text-gray-600 text-sm">Competencias técnicas</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Inventario de habilidades técnicas, certificaciones y competencias desarrolladas.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Próximamente
                                </span>
                            </div>
                        </div>

                        {/* Red Profesional */}
                        <div className="bg-white rounded-xl shadow-lg p-6 opacity-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-teal-100 p-3 rounded-lg">
                                    <Users className="text-teal-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Red Profesional</h3>
                                    <p className="text-gray-600 text-sm">Contactos y mentores</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Gestión de tu red profesional, mentores, referencias y contactos clave.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Próximamente
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarreraProfesionalPage;
