import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Brain, 
  Search, 
  BookOpen, 
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AIProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  skillName: string;
  learningName: string;
}

const AIProcessingModal: React.FC<AIProcessingModalProps> = ({
  isOpen,
  onComplete,
  skillName,
  learningName
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Brain,
      title: "Analizando tu aprendizaje",
      description: "El AI está revisando el contenido y contexto de tu aprendizaje...",
      duration: 2000
    },
    {
      icon: Search,
      title: "Buscando recursos relevantes",
      description: "Explorando bases de datos de cursos, libros y materiales educativos...",
      duration: 3000
    },
    {
      icon: BookOpen,
      title: "Organizando recursos encontrados",
      description: "Categorizando y filtrando los mejores recursos para tu nivel...",
      duration: 2500
    },
    {
      icon: CheckCircle2,
      title: "Finalizando resultados",
      description: "Preparando la presentación de recursos personalizados...",
      duration: 1500
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startProgress = () => {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 1;
        });
      }, 90); // Total ~9 segundos

      // Cambiar pasos
      steps.forEach((step, index) => {
        stepTimeout = setTimeout(() => {
          setCurrentStep(index);
        }, steps.slice(0, index).reduce((total, s) => total + s.duration, 0));
      });
    };

    startProgress();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepTimeout) clearTimeout(stepTimeout);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl">Mejorando con Inteligencia Artificial</CardTitle>
              <p className="text-sm opacity-90 mt-1">
                Procesando "{learningName}" en {skillName}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Información del paso actual */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {steps[currentStep]?.title || "Procesando..."}
              </h3>
              <p className="text-sm text-gray-600">
                {steps[currentStep]?.description || "El AI está trabajando en tu solicitud..."}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Lista de pasos */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Proceso de mejora:</h4>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : isCompleted 
                        ? 'bg-green-50' 
                        : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isCurrent 
                      ? 'font-medium text-blue-900' 
                      : isCompleted 
                        ? 'text-green-700' 
                        : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mensaje informativo */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800">
                  <strong>Ten paciencia:</strong> El AI está analizando múltiples fuentes para encontrar 
                  los mejores recursos educativos para tu aprendizaje. Este proceso puede tomar unos momentos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIProcessingModal;