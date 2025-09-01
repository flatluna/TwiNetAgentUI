import React, { useState, useEffect } from 'react';
import { ResumeFile } from '@/services/twinApiService';
import { 
    X, 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    GraduationCap, 
    Award, 
    Target, 
    BarChart3,
    FileText,
    Clock,
    Building,
    TrendingUp,
    Star,
    AlertTriangle,
    Loader2,
    Download,
    MapPin,
    Zap
} from 'lucide-react';

interface ResumeAnalysisModalProps {
    resume: ResumeFile | null;
    isOpen: boolean;
    onClose: () => void;
}

const ResumeAnalysisModal: React.FC<ResumeAnalysisModalProps> = ({ resume, isOpen, onClose }) => {
    const [pdfLoading, setPdfLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && resume) {
            console.log('📋 Resume Analysis Modal - Resume data:', resume);
            console.log('📋 Resume sasUrl:', resume.sasUrl);
            console.log('📋 Resume resumeData:', resume.resumeData);
            console.log('📋 Executive Summary:', resume.resumeData?.executive_summary || resume.executiveSummary);
            setPdfLoading(true);
            setError(null);
        }
    }, [isOpen, resume]);

    const handlePdfLoad = () => {
        setPdfLoading(false);
    };

    const handlePdfError = () => {
        setPdfLoading(false);
        setError('Error al cargar el PDF');
    };

    if (!isOpen || !resume) return null;

    const pdfUrl = resume.sasUrl || resume.fileUrl || resume.filePath;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Análisis Completo de CV</h2>
                            <p className="text-blue-100 text-sm">{resume.fileName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Two Column Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Column - PDF Viewer */}
                    <div className="w-1/2 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-medium text-gray-900 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Documento PDF
                                {pdfUrl && (
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Descargar
                                    </a>
                                )}
                            </h3>
                        </div>
                        
                        <div className="flex-1 relative">
                            {!pdfUrl ? (
                                <div className="flex items-center justify-center h-full bg-gray-50">
                                    <div className="text-center">
                                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                        <p className="text-gray-600">No hay URL de archivo disponible</p>
                                        <p className="text-gray-500 text-sm mt-2">Archivo: {resume.fileName}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {pdfLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                            <div className="text-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                                                <p className="text-gray-600">Cargando PDF...</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {error && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                            <div className="text-center">
                                                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                                <p className="text-red-600">{error}</p>
                                                <p className="text-gray-500 text-sm mt-2">URL: {pdfUrl}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full border-0"
                                        onLoad={handlePdfLoad}
                                        onError={handlePdfError}
                                        title="Resume PDF"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Analysis Details */}
                    <div className="w-1/2 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Executive Summary - Destacado al inicio */}
                            {(resume.executiveSummary || resume.resumeData?.executive_summary || resume.summary) && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200 shadow-lg">
                                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2 text-lg">
                                        <Star className="h-5 w-5 text-indigo-600" />
                                        {(resume.executiveSummary || resume.resumeData?.executive_summary) ? 'Resumen Ejecutivo' : 'Resumen Profesional'}
                                    </h3>
                                    {(resume.executiveSummary || resume.resumeData?.executive_summary) ? (
                                        <div 
                                            className="text-indigo-800 leading-relaxed [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:text-indigo-900 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:text-indigo-800 [&>p]:mb-3 [&>p]:text-sm [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mb-3 [&>li]:mb-1"
                                            dangerouslySetInnerHTML={{ 
                                                __html: resume.executiveSummary || resume.resumeData?.executive_summary || ''
                                            }}
                                        />
                                    ) : (
                                        <p className="text-indigo-800 leading-relaxed text-sm">
                                            {resume.summary}
                                        </p>
                                    )}
                                    <div className="mt-4 pt-3 border-t border-indigo-200">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            <Target className="h-3 w-3 mr-1" />
                                            {(resume.executiveSummary || resume.resumeData?.executive_summary) ? 'Generado por IA' : 'Extraído del CV'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Información Personal Completa */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    Información Personal Completa
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Nombre Completo</div>
                                                <div className="text-blue-700">{resume.fullName || resume.resumeData?.personal_information?.full_name || 'No disponible'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Email</div>
                                                <div className="text-blue-700">{resume.email || resume.resumeData?.personal_information?.email || 'No disponible'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Teléfono</div>
                                                <div className="text-blue-700">{resume.phoneNumber || resume.resumeData?.personal_information?.phone_number || 'No disponible'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Briefcase size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Posición Actual</div>
                                                <div className="text-blue-700">{resume.currentJobTitle || 'No disponible'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {resume.address && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <MapPin size={16} className="text-blue-600" />
                                        <div>
                                            <div className="font-medium text-blue-900">Dirección</div>
                                            <div className="text-blue-700">{resume.address}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Estadísticas del CV */}
                            <div className="bg-green-50 rounded-lg p-6">
                                <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Estadísticas del CV
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">
                                            {resume.totalWorkExperience}
                                        </div>
                                        <div className="text-sm text-blue-800 flex items-center justify-center gap-1">
                                            <Briefcase size={12} />
                                            Años Experiencia
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                                        <div className="text-2xl font-bold text-purple-600 mb-1">
                                            {resume.totalEducation}
                                        </div>
                                        <div className="text-sm text-purple-800 flex items-center justify-center gap-1">
                                            <GraduationCap size={12} />
                                            Educación
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                                        <div className="text-2xl font-bold text-green-600 mb-1">
                                            {resume.totalSkills}
                                        </div>
                                        <div className="text-sm text-green-800 flex items-center justify-center gap-1">
                                            <Zap size={12} />
                                            Habilidades
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-orange-200">
                                        <div className="text-2xl font-bold text-orange-600 mb-1">
                                            {resume.totalCertifications}
                                        </div>
                                        <div className="text-sm text-orange-800 flex items-center justify-center gap-1">
                                            <Award size={12} />
                                            Certificaciones
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-teal-200">
                                        <div className="text-2xl font-bold text-teal-600 mb-1">
                                            {resume.totalProjects}
                                        </div>
                                        <div className="text-sm text-teal-800 flex items-center justify-center gap-1">
                                            <Building size={12} />
                                            Proyectos
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-yellow-200">
                                        <div className="text-2xl font-bold text-yellow-600 mb-1">
                                            {resume.totalAwards}
                                        </div>
                                        <div className="text-sm text-yellow-800 flex items-center justify-center gap-1">
                                            <Star size={12} />
                                            Premios
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Experiencia Laboral Detallada */}
                            {resume.resumeData?.work_experience && resume.resumeData.work_experience.length > 0 && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                                    <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                                        <Briefcase size={20} />
                                        Experiencia Laboral Detallada
                                        <span className="ml-2 px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">
                                            {resume.totalWorkExperience} años de experiencia
                                        </span>
                                    </h3>
                                    <div className="space-y-4">
                                        {resume.resumeData.work_experience.map((exp, index) => (
                                            <div key={index} className="bg-white rounded-lg p-5 border border-amber-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">{exp.job_title}</h4>
                                                        <p className="text-amber-700 font-medium text-base">{exp.company}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                                        {exp.duration}
                                                    </span>
                                                </div>
                                                
                                                {exp.responsibilities && exp.responsibilities.length > 0 && (
                                                    <div>
                                                        <h5 className="font-medium text-gray-800 mb-3">Responsabilidades Principales:</h5>
                                                        <ul className="space-y-2">
                                                            {exp.responsibilities.map((resp, idx) => (
                                                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                                                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                                                    <span className="leading-relaxed">{resp}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Educación Detallada */}
                            {resume.resumeData?.education && resume.resumeData.education.length > 0 && (
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} />
                                        Educación Detallada
                                        <span className="ml-2 px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">
                                            {resume.totalEducation} títulos
                                        </span>
                                    </h3>
                                    <div className="space-y-4">
                                        {resume.resumeData.education.map((edu, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                        <p className="text-purple-700 font-medium">{edu.institution}</p>
                                                    </div>
                                                    {edu.graduation_year > 0 && (
                                                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                            {edu.graduation_year}
                                                        </span>
                                                    )}
                                                </div>
                                                {edu.location && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {edu.location}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Habilidades Detalladas */}
                            {resume.resumeData?.skills && resume.resumeData.skills.length > 0 && (
                                <div className="bg-indigo-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                                        <Zap size={20} />
                                        Habilidades Técnicas
                                        <span className="ml-2 px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded-full">
                                            {resume.totalSkills} habilidades
                                        </span>
                                    </h3>
                                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                                        <div className="flex flex-wrap gap-3">
                                            {resume.resumeData.skills.map((skill, index) => (
                                                <span 
                                                    key={index}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium border border-indigo-200 hover:bg-indigo-200 transition-colors"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Certificaciones */}
                            {resume.resumeData?.certifications && resume.resumeData.certifications.length > 0 && (
                                <div className="bg-orange-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                        <Award size={20} />
                                        Certificaciones
                                        <span className="ml-2 px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                                            {resume.totalCertifications} certificaciones
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {resume.resumeData.certifications.map((cert, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{cert.title}</h4>
                                                        <p className="text-orange-700 font-medium mt-1">{cert.issuing_organization}</p>
                                                    </div>
                                                    {cert.date_issued && (
                                                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full ml-4">
                                                            {cert.date_issued}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Premios y Reconocimientos */}
                            {resume.resumeData?.awards && resume.resumeData.awards.length > 0 && (
                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                                        <Star size={20} />
                                        Premios y Reconocimientos
                                        <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                                            {resume.totalAwards} premios
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {resume.resumeData.awards.map((award, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-yellow-100 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{award.title}</h4>
                                                        <p className="text-yellow-700 font-medium">{award.organization}</p>
                                                    </div>
                                                    {award.year > 0 && (
                                                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                            {award.year}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Información del Documento */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText size={20} />
                                    Información del Documento
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-500" />
                                        <div>
                                            <div className="font-medium">Procesado</div>
                                            <div className="text-gray-600">{new Date(resume.processedAt).toLocaleDateString('es-ES')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-gray-500" />
                                        <div>
                                            <div className="font-medium">Archivo</div>
                                            <div className="text-gray-600">{resume.fileName}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-green-500" />
                                        <div>
                                            <div className="font-medium">Estado</div>
                                            <div className="text-green-600">{resume.success ? 'Procesado exitosamente' : 'Error en procesamiento'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building size={16} className="text-blue-500" />
                                        <div>
                                            <div className="font-medium">Empresa Actual</div>
                                            <div className="text-gray-600">{resume.currentCompany || 'No especificada'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        {/* Información Personal */}
                        {resume.personalInfo && (
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    Información Personal Extraída
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Nombre Completo</div>
                                                <div className="text-blue-700">{resume.personalInfo.fullName || 'No disponible'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Email</div>
                                                <div className="text-blue-700">{resume.personalInfo.email || 'No disponible'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Teléfono</div>
                                                <div className="text-blue-700">{resume.personalInfo.phoneNumber || 'No disponible'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Briefcase size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Posición Actual</div>
                                                <div className="text-blue-700">{resume.personalInfo.currentPosition || 'No disponible'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resumen Profesional */}
                        {resume.professionalSummary && (
                            <div className="bg-purple-50 rounded-lg p-6">
                                <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                    <Target size={20} />
                                    Resumen Profesional
                                </h3>
                                <p className="text-purple-800 leading-relaxed">
                                    {resume.professionalSummary}
                                </p>
                            </div>
                        )}

                        {/* Estadísticas del CV */}
                        {resume.stats && (
                            <div className="bg-green-50 rounded-lg p-6">
                                <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Estadísticas del CV
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">
                                            {resume.stats.workExperience}
                                        </div>
                                        <div className="text-sm text-blue-800 flex items-center justify-center gap-1">
                                            <Briefcase size={12} />
                                            Experiencia Laboral
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                                        <div className="text-2xl font-bold text-purple-600 mb-1">
                                            {resume.stats.education}
                                        </div>
                                        <div className="text-sm text-purple-800 flex items-center justify-center gap-1">
                                            <GraduationCap size={12} />
                                            Educación
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                                        <div className="text-2xl font-bold text-green-600 mb-1">
                                            {resume.stats.skills}
                                        </div>
                                        <div className="text-sm text-green-800 flex items-center justify-center gap-1">
                                            <TrendingUp size={12} />
                                            Habilidades
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-orange-200">
                                        <div className="text-2xl font-bold text-orange-600 mb-1">
                                            {resume.stats.certifications}
                                        </div>
                                        <div className="text-sm text-orange-800 flex items-center justify-center gap-1">
                                            <Award size={12} />
                                            Certificaciones
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-teal-200">
                                        <div className="text-2xl font-bold text-teal-600 mb-1">
                                            {resume.stats.projects}
                                        </div>
                                        <div className="text-sm text-teal-800 flex items-center justify-center gap-1">
                                            <Building size={12} />
                                            Proyectos
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center border border-yellow-200">
                                        <div className="text-2xl font-bold text-yellow-600 mb-1">
                                            {resume.stats.awards}
                                        </div>
                                        <div className="text-sm text-yellow-800 flex items-center justify-center gap-1">
                                            <Star size={12} />
                                            Premios/Logros
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Skills */}
                        {resume.topSkills && resume.topSkills.length > 0 && (
                            <div className="bg-indigo-50 rounded-lg p-6">
                                <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                                    <Award size={20} />
                                    Principales Habilidades Identificadas
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {resume.topSkills.map((skill, index) => (
                                        <span 
                                            key={index}
                                            className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estado de Procesamiento */}
                        {resume.status && (
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Estado del Procesamiento
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className={`p-3 rounded-lg text-center ${
                                        resume.status.isComplete 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    }`}>
                                        <div className="font-medium mb-1">Completitud</div>
                                        <div className="text-sm">
                                            {resume.status.isComplete ? '✅ Completo' : '⚠️ Parcial'}
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg text-center ${
                                        resume.status.hasWorkExperience 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        <div className="font-medium mb-1">Experiencia</div>
                                        <div className="text-sm">
                                            {resume.status.hasWorkExperience ? '✅ Detectada' : '❌ No detectada'}
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg text-center ${
                                        resume.status.hasEducation 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        <div className="font-medium mb-1">Educación</div>
                                        <div className="text-sm">
                                            {resume.status.hasEducation ? '✅ Detectada' : '❌ No detectada'}
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg text-center ${
                                        resume.status.hasSkills 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        <div className="font-medium mb-1">Habilidades</div>
                                        <div className="text-sm">
                                            {resume.status.hasSkills ? '✅ Detectadas' : '❌ No detectadas'}
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg text-center ${
                                        resume.status.hasCertifications 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        <div className="font-medium mb-1">Certificaciones</div>
                                        <div className="text-sm">
                                            {resume.status.hasCertifications ? '✅ Detectadas' : '❌ No detectadas'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalysisModal;
