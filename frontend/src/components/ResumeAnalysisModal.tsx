import React, { useState, useEffect } from 'react';
import { ResumeFile, twinApiService } from '@/services/twinApiService';
import { useMsal } from '@azure/msal-react';
import { 
    X, 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    GraduationCap, 
    Award, 
    Target, 
    FileText,
    Building,
    Star,
    AlertTriangle,
    Loader2,
    Download,
    MapPin
} from 'lucide-react';

interface ResumeAnalysisModalProps {
    resume: ResumeFile | null;
    isOpen: boolean;
    onClose: () => void;
}

const ResumeAnalysisModal: React.FC<ResumeAnalysisModalProps> = ({ resume, isOpen, onClose }) => {
    const [pdfLoading, setPdfLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const { accounts } = useMsal();

    // Get current user's twinId
    const getCurrentTwinId = () => {
        if (accounts.length > 0) {
            const account = accounts[0];
            return account.localAccountId;
        }
        return null;
    };

    useEffect(() => {
        const fetchPdfFile = async () => {
            if (!isOpen || !resume) return;

            // First check if we already have a SasUrl
            const resumeAny = resume as any;
            const existingSasUrl = resumeAny.SasUrl || resumeAny.doc?.SasUrl || resume.sasUrl;
            
            if (existingSasUrl) {
                console.log('✅ Found existing SasUrl, no need to fetch:', existingSasUrl);
                return;
            }

            const twinId = getCurrentTwinId();
            if (!twinId || !resume.fileName) {
                console.warn('❌ Missing twinId or fileName for PDF fetch');
                return;
            }

            try {
                console.log('📥 No SasUrl found, fetching PDF file for:', resume.fileName);
                const response = await twinApiService.getResumeFile(twinId, resume.fileName);
                
                if (response.success && response.data) {
                    // Create a blob URL from the response
                    const blobUrl = URL.createObjectURL(response.data);
                    setPdfBlobUrl(blobUrl);
                    console.log('✅ PDF blob URL created:', blobUrl);
                } else {
                    console.warn('❌ Failed to fetch PDF file:', response.error);
                    setError('No se pudo cargar el archivo PDF');
                }
            } catch (error) {
                console.error('❌ Error fetching PDF file:', error);
                setError('Error al cargar el archivo PDF');
            }
        };

        if (isOpen && resume) {
            console.log('📋 Resume Analysis Modal - Resume data:', resume);
            console.log('📋 Resume sasUrl:', resume.sasUrl);
            console.log('📋 Resume SasUrl:', (resume as any).SasUrl);
            console.log('📋 Resume doc.SasUrl:', (resume as any).doc?.SasUrl);
            console.log('📋 Resume resumeData:', resume.resumeData);
            console.log('📋 Executive Summary:', resume.resumeData?.executive_summary || resume.executiveSummary);
            
            // Check if we have nested resume data structure
            if (resume.resumeData) {
                console.log('✅ Found nested resume data structure');
                console.log('📋 Personal Info:', resume.resumeData.personal_information);
                console.log('📋 Work Experience:', resume.resumeData.work_experience);
                console.log('📋 Education:', resume.resumeData.education);
                console.log('📋 Skills:', resume.resumeData.skills);
            }
            
            setPdfLoading(true);
            setError(null);
            setPdfBlobUrl(null);
            
            // Fetch the PDF file only if we don't have a SasUrl
            fetchPdfFile();
        }

        // Cleanup function to revoke blob URL
        return () => {
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [isOpen, resume]);

    const handlePdfLoad = () => {
        setPdfLoading(false);
    };

    const handlePdfError = () => {
        setPdfLoading(false);
        setError('Error al cargar el PDF');
    };

    if (!isOpen || !resume) return null;

    // Try multiple sources for the PDF URL, prioritizing SasUrl fields first
    const resumeAny = resume as any;
    const pdfUrl = resumeAny.SasUrl ||  // Check for SasUrl at root level first
                   resumeAny.doc?.SasUrl ||  // Check for doc.SasUrl second
                   resume.sasUrl ||  // Check legacy sasUrl
                   pdfBlobUrl ||  // Use blob URL as fallback
                   resume.fileUrl || 
                   resume.filePath || 
                   resumeAny.url ||
                   resumeAny.downloadUrl ||
                   resumeAny.blobUrl;

    console.log('🔍 PDF URL Detection:', {
        SasUrl: resumeAny.SasUrl,
        docSasUrl: resumeAny.doc?.SasUrl,
        sasUrl: resume.sasUrl,
        pdfBlobUrl: pdfBlobUrl,
        fileUrl: resume.fileUrl,
        filePath: resume.filePath,
        url: resumeAny.url,
        downloadUrl: resumeAny.downloadUrl,
        blobUrl: resumeAny.blobUrl,
        finalPdfUrl: pdfUrl
    });

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
                                        download={resume.fileName}
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
                                        {pdfLoading ? (
                                            <>
                                                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                                                <p className="text-gray-600">Descargando archivo PDF...</p>
                                                <p className="text-gray-500 text-sm mt-2">Archivo: {resume.fileName}</p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                                <p className="text-gray-600">No se pudo cargar el archivo PDF</p>
                                                <p className="text-gray-500 text-sm mt-2">Archivo: {resume.fileName}</p>
                                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                                            </>
                                        )}
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
                            {(resume.executiveSummary || resume.resumeData?.executive_summary || resume.summary || resume.resumeData?.summary) && (
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
                                            {resume.summary || resume.resumeData?.summary}
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
                                                <div className="text-blue-700">
                                                    {resume.fullName || 
                                                     resume.resumeData?.personal_information?.full_name || 
                                                     'No disponible'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Email</div>
                                                <div className="text-blue-700">
                                                    {resume.email || 
                                                     resume.resumeData?.personal_information?.email || 
                                                     'No disponible'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Teléfono</div>
                                                <div className="text-blue-700">
                                                    {resume.phoneNumber || 
                                                     resume.resumeData?.personal_information?.phone_number || 
                                                     'No disponible'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <MapPin size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">Dirección</div>
                                                <div className="text-blue-700">
                                                    {resume.address || 
                                                     resume.resumeData?.personal_information?.address || 
                                                     'No disponible'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building size={16} className="text-blue-600" />
                                            <div>
                                                <div className="font-medium text-blue-900">LinkedIn</div>
                                                <div className="text-blue-700">
                                                    {resume.linkedin || 
                                                     resume.resumeData?.personal_information?.linkedin || 
                                                     'No disponible'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Experiencia Laboral Detallada */}
                            {resume.resumeData?.work_experience && resume.resumeData.work_experience.length > 0 && (
                                <div className="bg-green-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                                        <Briefcase size={20} />
                                        Experiencia Laboral ({resume.resumeData.work_experience.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {resume.resumeData.work_experience.slice(0, 3).map((job: any, index: number) => (
                                            <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                                                <div className="font-semibold text-green-900">{job.job_title}</div>
                                                <div className="text-green-700 font-medium">{job.company}</div>
                                                <div className="text-green-600 text-sm">{job.duration}</div>
                                                {job.responsibilities && job.responsibilities.length > 0 && (
                                                    <div className="mt-2">
                                                        <div className="text-sm text-green-800 font-medium mb-1">Responsabilidades:</div>
                                                        <ul className="text-sm text-green-700 list-disc list-inside">
                                                            {job.responsibilities.slice(0, 2).map((resp: string, respIndex: number) => (
                                                                <li key={respIndex}>{resp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {resume.resumeData.work_experience.length > 3 && (
                                            <div className="text-center">
                                                <span className="text-green-600 text-sm">
                                                    +{resume.resumeData.work_experience.length - 3} experiencias más
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Educación */}
                            {resume.resumeData?.education && resume.resumeData.education.length > 0 && (
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} />
                                        Educación ({resume.resumeData.education.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {resume.resumeData.education.map((edu: any, index: number) => (
                                            <div key={index} className="border-l-4 border-purple-400 pl-4 py-2">
                                                <div className="font-semibold text-purple-900">{edu.degree}</div>
                                                <div className="text-purple-700 font-medium">{edu.institution}</div>
                                                <div className="text-purple-600 text-sm">
                                                    {edu.location} {edu.graduation_year && edu.graduation_year > 0 && `• ${edu.graduation_year}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Habilidades */}
                            {resume.resumeData?.skills && resume.resumeData.skills.length > 0 && (
                                <div className="bg-yellow-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                                        <Award size={20} />
                                        Habilidades ({resume.resumeData.skills.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {resume.resumeData.skills.map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="bg-yellow-200 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
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
