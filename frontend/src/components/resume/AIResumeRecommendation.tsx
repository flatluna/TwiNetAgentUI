import React, { useState, useEffect } from 'react';
import { 
    Brain, 
    Download, 
    Copy, 
    Star, 
    Award, 
    BookOpen, 
    Code, 
    Globe, 
    Target, 
    Zap,
    RefreshCw,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface OportunidadEmpleo {
    id?: string;
    empresa: string;
    puesto: string;
    descripcion: string;
    responsabilidades: string;
    habilidadesRequeridas: string;
    salario: string;
    beneficios: string;
    ubicacion: string;
    fechaAplicacion: string;
    estado: 'aplicado' | 'entrevista' | 'esperando' | 'rechazado' | 'aceptado' | 'interesado';
    URLCompany?: string;
    contactoNombre?: string;
    contactoEmail?: string;
    contactoTelefono?: string;
    notas?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}

interface AIResumeProps {
    oportunidad: OportunidadEmpleo | null;
    twinId: string;
}

interface ResumeSection {
    titulo: string;
    contenido: string;
    puntuacion: number;
}

interface AIResumeData {
    resumenProfesional: string;
    experienciaRelevante: ResumeSection[];
    habilidadesClave: string[];
    certificacionesRecomendadas: string[];
    puntuacionCompatibilidad: number;
    mejorasSugeridas: string[];
    fortalezas: string[];
    isGenerating: boolean;
    error?: string;
}

const AIResumeRecommendation: React.FC<AIResumeProps> = ({ oportunidad, twinId }) => {
    const [resumeData, setResumeData] = useState<AIResumeData>({
        resumenProfesional: '',
        experienciaRelevante: [],
        habilidadesClave: [],
        certificacionesRecomendadas: [],
        puntuacionCompatibilidad: 0,
        mejorasSugeridas: [],
        fortalezas: [],
        isGenerating: false
    });

    const [isLoading, setIsLoading] = useState(false);

    const generateAIResume = async () => {
        if (!oportunidad || !twinId) return;

        setIsLoading(true);
        setResumeData(prev => ({ ...prev, isGenerating: true, error: undefined }));

        try {
            // Simular llamada a la API de AI
            // En producción, aquí iría la llamada real al servicio de AI
            await new Promise(resolve => setTimeout(resolve, 3000));

            const mockResumeData: AIResumeData = {
                resumenProfesional: `Profesional con experiencia sólida en ${oportunidad.beneficios || 'el sector'} especializado en las áreas clave requeridas por ${oportunidad.empresa}. Con habilidades comprobadas en las responsabilidades principales del puesto y enfoque en resultados medibles.`,
                experienciaRelevante: [
                    {
                        titulo: "Experiencia en " + (oportunidad.beneficios || 'el sector'),
                        contenido: "Experiencia relevante que coincide con los requisitos del puesto en " + oportunidad.empresa,
                        puntuacion: 85
                    },
                    {
                        titulo: "Proyectos Similares",
                        contenido: "Proyectos que demuestran competencias alineadas con las responsabilidades del rol",
                        puntuacion: 78
                    }
                ],
                habilidadesClave: [
                    "Liderazgo de equipos",
                    "Gestión de proyectos",
                    "Comunicación efectiva",
                    "Resolución de problemas",
                    "Adaptabilidad"
                ],
                certificacionesRecomendadas: [
                    "Certificación en Gestión de Proyectos (PMP)",
                    "Certificación específica del sector",
                    "Certificación en metodologías ágiles"
                ],
                puntuacionCompatibilidad: 82,
                mejorasSugeridas: [
                    "Destacar experiencia específica en el sector de " + oportunidad.empresa,
                    "Incluir métricas cuantificables de logros",
                    "Adaptar palabras clave del puesto en la descripción"
                ],
                fortalezas: [
                    "Alineación con responsabilidades clave",
                    "Experiencia en entornos similares",
                    "Habilidades transferibles relevantes"
                ],
                isGenerating: false
            };

            setResumeData(mockResumeData);
        } catch (error) {
            setResumeData(prev => ({ 
                ...prev, 
                isGenerating: false, 
                error: 'Error al generar el resume. Por favor, intenta nuevamente.' 
            }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (oportunidad && twinId) {
            generateAIResume();
        }
    }, [oportunidad?.id, twinId]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Aquí podrías agregar una notificación de copiado exitoso
    };

    const downloadResume = () => {
        // Implementar descarga del resume
        const resumeText = `
RESUME RECOMENDADO POR AI

${resumeData.resumenProfesional}

EXPERIENCIA RELEVANTE:
${resumeData.experienciaRelevante.map(exp => `- ${exp.titulo}: ${exp.contenido}`).join('\n')}

HABILIDADES CLAVE:
${resumeData.habilidadesClave.map(hab => `- ${hab}`).join('\n')}

CERTIFICACIONES RECOMENDADAS:
${resumeData.certificacionesRecomendadas.map(cert => `- ${cert}`).join('\n')}
        `;

        const blob = new Blob([resumeText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-ai-${oportunidad?.puesto?.replace(/\s+/g, '-')}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (!oportunidad) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Selecciona una oportunidad para generar recomendaciones de AI</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Resume Recomendado por AI</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={generateAIResume}
                            disabled={isLoading}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Regenerar"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={downloadResume}
                            disabled={isLoading || !resumeData.resumenProfesional}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descargar"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {isLoading || resumeData.isGenerating ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-600">Generando resume optimizado con AI...</p>
                    </div>
                ) : resumeData.error ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                        <p className="text-red-600 mb-3">{resumeData.error}</p>
                        <button
                            onClick={generateAIResume}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Intentar nuevamente
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Puntuación de Compatibilidad */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">Compatibilidad con el Puesto</h4>
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="font-bold text-lg">{resumeData.puntuacionCompatibilidad}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${resumeData.puntuacionCompatibilidad}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Resumen Profesional */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                                    Resumen Profesional
                                </h4>
                                <button
                                    onClick={() => copyToClipboard(resumeData.resumenProfesional)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    title="Copiar"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                {resumeData.resumenProfesional}
                            </p>
                        </div>

                        {/* Experiencia Relevante */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Award className="w-4 h-4 mr-2 text-blue-600" />
                                Experiencia Relevante
                            </h4>
                            <div className="space-y-3">
                                {resumeData.experienciaRelevante.map((exp, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium text-gray-800">{exp.titulo}</h5>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                                    <div 
                                                        className="bg-green-500 h-1.5 rounded-full"
                                                        style={{ width: `${exp.puntuacion}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600">{exp.puntuacion}%</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm">{exp.contenido}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Habilidades Clave */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-blue-600" />
                                Habilidades Clave
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.habilidadesClave.map((habilidad, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                    >
                                        {habilidad}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Fortalezas */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Fortalezas Identificadas
                            </h4>
                            <div className="space-y-2">
                                {resumeData.fortalezas.map((fortaleza, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">{fortaleza}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certificaciones Recomendadas */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                                Certificaciones Recomendadas
                            </h4>
                            <div className="space-y-2">
                                {resumeData.certificacionesRecomendadas.map((cert, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                        <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                        <span className="text-gray-700">{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mejoras Sugeridas */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Code className="w-4 h-4 mr-2 text-orange-600" />
                                Mejoras Sugeridas
                            </h4>
                            <div className="space-y-2">
                                {resumeData.mejorasSugeridas.map((mejora, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-700 text-sm">{mejora}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIResumeRecommendation;
