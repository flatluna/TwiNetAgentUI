import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Globe, 
  Brain, 
  Sparkles, 
  Zap,
  BookOpen,
  CheckCircle,
  Clock
} from "lucide-react";

interface AISearchLoadingModalProps {
  isOpen: boolean;
  searchQuery: string;
}

interface SearchStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  color: string;
}

// Componente Progress simple
const Progress: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const AISearchLoadingModal: React.FC<AISearchLoadingModalProps> = ({
  isOpen,
  searchQuery
}) => {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<SearchStep[]>([
    {
      id: 'analyzing',
      title: 'Analizando tu consulta',
      description: 'Procesando y entendiendo tu consulta con IA avanzada',
      icon: <Brain className="w-5 h-5" />,
      completed: false,
      active: true,
      color: 'bg-blue-500'
    },
    {
      id: 'searching',
      title: 'Búsqueda inteligente en Google',
      description: 'Buscando cursos relevantes en múltiples fuentes online',
      icon: <Search className="w-5 h-5" />,
      completed: false,
      active: false,
      color: 'bg-green-500'
    },
    {
      id: 'bing',
      title: 'Expansión con Bing',
      description: 'Ampliando resultados con búsquedas adicionales en Bing',
      icon: <Globe className="w-5 h-5" />,
      completed: false,
      active: false,
      color: 'bg-purple-500'
    },
    {
      id: 'processing',
      title: 'Procesamiento con IA',
      description: 'Analizando y filtrando resultados con inteligencia artificial',
      icon: <Sparkles className="w-5 h-5" />,
      completed: false,
      active: false,
      color: 'bg-yellow-500'
    },
    {
      id: 'structuring',
      title: 'Estructurando información',
      description: 'Organizando y preparando los mejores cursos encontrados',
      icon: <BookOpen className="w-5 h-5" />,
      completed: false,
      active: false,
      color: 'bg-indigo-500'
    }
  ]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setSteps(prev => prev.map(step => ({ ...step, completed: false, active: step.id === 'analyzing' })));
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 8 + 2, 95);
        
        // Actualizar pasos basado en el progreso
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        
        setSteps(prevSteps => prevSteps.map((step, index) => ({
          ...step,
          completed: index < stepIndex,
          active: index === stepIndex
        })));
        
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Búsqueda Inteligente de Cursos
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Procesando: <span className="font-medium text-blue-700">"{searchQuery}"</span>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de progreso principal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progreso general</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-gray-200"
            />
          </div>

          {/* Pasos del proceso */}
          <div className="space-y-3">
            {steps.map((step) => (
              <Card 
                key={step.id}
                className={`p-4 transition-all duration-500 border-2 ${
                  step.active 
                    ? 'border-blue-300 bg-blue-50 shadow-lg scale-105' 
                    : step.completed 
                      ? 'border-green-200 bg-green-50 shadow-sm'
                      : 'border-gray-200 bg-white shadow-sm opacity-60'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`rounded-full p-2 ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.active 
                        ? step.color + ' text-white animate-pulse'
                        : 'bg-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      step.active ? 'text-blue-700' : step.completed ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {step.completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Completado
                      </Badge>
                    )}
                    {step.active && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Procesando...
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Información adicional */}
          <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 rounded-full p-2">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-700">Búsqueda potenciada por IA</h4>
                <p className="text-sm text-indigo-600">
                  Utilizamos inteligencia artificial para encontrar los mejores cursos según tus necesidades específicas
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISearchLoadingModal;