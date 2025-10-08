import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  Award,
  Lightbulb,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillData } from '@/services/skillsApiService';

interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillData[];
  onEnhanceSkills: (selectedSkills: string[]) => void;
}

interface Enhancement {
  skillId: string;
  suggestions: string[];
  newCertifications: string[];
  careerPaths: string[];
  marketTrends: string[];
}

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({
  isOpen,
  onClose,
  skills,
  onEnhanceSkills
}) => {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [step, setStep] = useState<'initial' | 'analyzing' | 'results'>('initial');

  const handleAnalyze = async () => {
    setStep('analyzing');

    // Simular análisis de IA
    setTimeout(() => {
      const mockEnhancements: Enhancement[] = skills.map(skill => ({
        skillId: skill.id || '',
        suggestions: [
          `Para ${skill.name}: Considera especializarte en tecnologías emergentes del sector`,
          `Documenta tus casos de éxito para crear un portafolio profesional`,
          `Networking con profesionales de ${skill.category} puede abrir nuevas oportunidades`
        ],
        newCertifications: [
          `Certificación Avanzada en ${skill.name}`,
          `Especialización Digital para ${skill.category}`,
          `Gestión de Proyectos en ${skill.category}`
        ],
        careerPaths: [
          `Consultor Senior en ${skill.name}`,
          `Instructor/Formador de ${skill.category}`,
          `Especialista en Innovación - ${skill.category}`
        ],
        marketTrends: [
          `La digitalización está transformando ${skill.category}`,
          `Creciente demanda de sostenibilidad en ${skill.category}`,
          `Automatización e IA impactando ${skill.category}`
        ]
      }));

      setEnhancements(mockEnhancements);
      setStep('results');
    }, 3000);
  };

  const applyEnhancements = () => {
    // Enviar solo los IDs de las habilidades que tienen mejoras
    const skillIds = enhancements.map(e => e.skillId);
    
    onEnhanceSkills(skillIds);
    onClose();
    setStep('initial');
    setEnhancements([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Potenciador de Habilidades IA
              </h2>
              <p className="text-sm text-gray-600">
                Mejora tu perfil profesional con insights basados en IA
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {step === 'initial' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Análisis Inteligente de Habilidades
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Nuestra IA analizará tus {skills.length} habilidades para proporcionarte:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Tendencias</h4>
                    <p className="text-sm text-gray-600">Mercado actual</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-4">
                    <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Certificaciones</h4>
                    <p className="text-sm text-gray-600">Recomendadas</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-4">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Rutas</h4>
                    <p className="text-sm text-gray-600">Carrera profesional</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-4">
                    <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Insights</h4>
                    <p className="text-sm text-gray-600">Personalizados</p>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={handleAnalyze}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Iniciar Análisis IA
              </Button>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="text-center space-y-6 py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Analizando tus Habilidades...
                </h3>
                <p className="text-gray-600">
                  La IA está procesando tu perfil profesional y generando insights personalizados
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  Tendencias
                </div>
                <div className="text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  Certificaciones
                </div>
                <div className="text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  Rutas
                </div>
                <div className="text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  Insights
                </div>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Análisis Completado!
                </h3>
                <p className="text-gray-600">
                  Hemos generado insights personalizados para cada una de tus habilidades
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {skills.map((skill) => {
                  const enhancement = enhancements.find(e => e.skillId === skill.id);
                  return (
                    <Card key={skill.id} className="border-2 border-purple-100">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span>{skill.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
                            Sugerencias
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {enhancement?.suggestions.slice(0, 2).map((suggestion, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Award className="w-4 h-4 mr-1 text-green-600" />
                            Certificaciones Recomendadas
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {enhancement?.newCertifications.slice(0, 2).map((cert, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{cert}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
                            Tendencias del Mercado
                          </h5>
                          <p className="text-sm text-gray-600">
                            {enhancement?.marketTrends[0]}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-4 pt-6">
                <Button variant="outline" onClick={onClose}>
                  Cerrar sin Aplicar
                </Button>
                <Button 
                  onClick={applyEnhancements}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aplicar Mejoras
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementModal;