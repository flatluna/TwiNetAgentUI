import React, { useState, useEffect } from 'react';
import { 
    Brain, 
    Download, 
    RefreshCw, 
    CheckCircle, 
    XCircle, 
    Star,
    User,
    Briefcase,
    GraduationCap,
    Award,
    Target,
    TrendingUp
} from 'lucide-react';
import { Button } from './button';

interface AIResumeRecommendationProps {
    jobDescription: string;
    jobTitle: string;
    company: string;
}

interface RecommendationSection {
    id: string;
    title: string;
    original: string;
    recommended: string;
    confidence: number;
    reason: string;
}

const AIResumeRecommendation: React.FC<AIResumeRecommendationProps> = ({
    jobDescription,
    jobTitle,
    company
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
    const [isGeneratingResume, setIsGeneratingResume] = useState(false);

    // Simulación de análisis de IA
    const analyzeCompatibility = async () => {
        setIsAnalyzing(true);
        
        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generar puntaje de compatibilidad simulado
        const score = Math.floor(Math.random() * 30) + 70; // Entre 70-100
        setCompatibilityScore(score);
        
        // Generar recomendaciones simuladas
        const mockRecommendations: RecommendationSection[] = [
            {
                id: 'summary',
                title: 'Resumen Profesional',
                original: 'Profesional con experiencia en desarrollo de software...',
                recommended: `Profesional especializado en ${jobTitle.toLowerCase()} con experiencia demostrada en las tecnologías y metodologías requeridas por ${company}. Enfoque en resultados medibles y mejora continua de procesos.`,
                confidence: 92,
                reason: 'Alineado con las palabras clave del puesto y cultura empresarial'
            },
            {
                id: 'skills',
                title: 'Habilidades Clave',
                original: 'JavaScript, React, Node.js, Git...',
                recommended: 'JavaScript • React • Node.js • TypeScript • AWS • Metodologías Ágiles • Liderazgo de Equipos • Análisis de Datos',
                confidence: 88,
                reason: 'Incluye tecnologías específicas mencionadas en la descripción del puesto'
            },
            {
                id: 'experience',
                title: 'Experiencia Laboral',
                original: 'Desarrollador Frontend en XYZ Corp...',
                recommended: `${jobTitle} Senior con 5+ años optimizando procesos similares a los requeridos en ${company}. Logré aumentar la eficiencia del equipo en 35% implementando mejores prácticas.`,
                confidence: 85,
                reason: 'Enfatiza logros cuantificables relevantes para el puesto objetivo'
            },
            {
                id: 'education',
                title: 'Formación y Certificaciones',
                original: 'Licenciatura en Ingeniería de Sistemas...',
                recommended: 'Ingeniería de Sistemas • Certificación AWS Solutions Architect • Curso de Liderazgo Empresarial • Diplomado en Gestión de Proyectos Ágiles',
                confidence: 79,
                reason: 'Incluye certificaciones valoradas por el empleador objetivo'
            }
        ];
        
        setRecommendations(mockRecommendations);
        setIsAnalyzing(false);
    };

    const generateOptimizedResume = async () => {
        setIsGeneratingResume(true);
        
        // Simular generación de currículum
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simular descarga de archivo
        const blob = new Blob(['Currículum optimizado generado por IA...'], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_Optimizado_${company}_${jobTitle.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsGeneratingResume(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 75) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getConfidenceIcon = (confidence: number) => {
        if (confidence >= 85) return <CheckCircle className="text-green-500" size={20} />;
        if (confidence >= 70) return <Star className="text-yellow-500" size={20} />;
        return <XCircle className="text-red-500" size={20} />;
    };

    useEffect(() => {
        // Auto-analizar al cargar el componente
        if (jobDescription && jobTitle) {
            analyzeCompatibility();
        }
    }, [jobDescription, jobTitle]);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Brain size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">IA Resume Optimizer</h2>
                            <p className="text-purple-100">Optimiza tu currículum para este puesto</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={analyzeCompatibility}
                        disabled={isAnalyzing}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
                        {isAnalyzing ? 'Analizando...' : 'Re-analizar'}
                    </Button>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-600">Analizando compatibilidad con IA...</p>
                        <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Puntaje de Compatibilidad */}
                        {compatibilityScore !== null && (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-purple-600" />
                                    Puntaje de Compatibilidad
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(compatibilityScore)}`}>
                                        {compatibilityScore}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${compatibilityScore}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {compatibilityScore >= 90 ? 'Excelente match' : 
                                             compatibilityScore >= 75 ? 'Buen match' : 'Necesita optimización'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recomendaciones */}
                        {recommendations.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Target size={20} className="text-purple-600" />
                                    Recomendaciones de Optimización
                                </h3>
                                
                                {recommendations.map((rec) => (
                                    <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                                {rec.id === 'summary' && <User size={16} />}
                                                {rec.id === 'skills' && <Award size={16} />}
                                                {rec.id === 'experience' && <Briefcase size={16} />}
                                                {rec.id === 'education' && <GraduationCap size={16} />}
                                                {rec.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {getConfidenceIcon(rec.confidence)}
                                                <span className="text-sm text-gray-600">{rec.confidence}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="bg-red-50 p-3 rounded border-l-4 border-red-200">
                                                <p className="text-sm font-medium text-red-800 mb-1">Original:</p>
                                                <p className="text-sm text-red-700">{rec.original}</p>
                                            </div>
                                            
                                            <div className="bg-green-50 p-3 rounded border-l-4 border-green-200">
                                                <p className="text-sm font-medium text-green-800 mb-1">Recomendado:</p>
                                                <p className="text-sm text-green-700">{rec.recommended}</p>
                                            </div>
                                            
                                            <div className="bg-blue-50 p-2 rounded">
                                                <p className="text-xs text-blue-700">
                                                    <strong>Razón:</strong> {rec.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Botón de Generar Currículum Optimizado */}
                        {recommendations.length > 0 && (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Download size={20} className="text-purple-600" />
                                    Generar Currículum Optimizado
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Crea una versión optimizada de tu currículum aplicando todas las recomendaciones de IA
                                </p>
                                <Button
                                    onClick={generateOptimizedResume}
                                    disabled={isGeneratingResume}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    {isGeneratingResume ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin mr-2" />
                                            Generando currículum...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} className="mr-2" />
                                            Descargar CV Optimizado
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIResumeRecommendation;
