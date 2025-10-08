import React, { useState } from 'react';
import { X, Brain, Loader2, Sparkles, FileText, Target, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LearningData {
  id?: string;
  name: string;
  description: string;
  content: string;
  skillId: string;
  skillName: string;
}

interface LearningAIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  learningData: LearningData;
  onEnhance: (enhancementRequest: string) => Promise<void>;
}

const LearningAIEnhancementModal: React.FC<LearningAIEnhancementModalProps> = ({
  isOpen,
  onClose,
  learningData,
  onEnhance
}) => {
  const [enhancementRequest, setEnhancementRequest] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnhance = async () => {
    if (!enhancementRequest.trim()) {
      alert('Por favor describe qué quieres que el AI mejore o amplíe');
      return;
    }

    setIsProcessing(true);
    try {
      await onEnhance(enhancementRequest);
      setEnhancementRequest('');
      onClose();
    } catch (error) {
      console.error('Error al procesar mejora con AI:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="truncate">Mejorar Aprendizaje con AI</span>
              </div>
              <div className="px-2 sm:px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 flex-shrink-0">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">POTENCIADO POR </span>AI
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información del aprendizaje actual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              Información del Aprendizaje Actual
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-800 mb-1">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Habilidad
                </label>
                <Input
                  value={learningData.skillName}
                  readOnly
                  className="bg-white border-blue-300 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-800 mb-1">
                  ID de Habilidad
                </label>
                <Input
                  value={learningData.skillId}
                  readOnly
                  className="bg-white border-blue-300 font-mono text-xs sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-blue-800 mb-1">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Nombre del Aprendizaje
              </label>
              <Input
                value={learningData.name}
                readOnly
                className="bg-white border-blue-300 text-sm"
              />
            </div>
            
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-blue-800 mb-1">
                Descripción de la Habilidad
              </label>
              <textarea
                value={learningData.description}
                readOnly
                className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white resize-none text-sm"
                rows={3}
              />
            </div>
            
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-blue-800 mb-1">
                Contenido Actual del Aprendizaje
              </label>
              <div 
                className="max-h-32 sm:max-h-40 overflow-y-auto bg-white border border-blue-300 rounded-md p-2 sm:p-3 prose prose-xs sm:prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: learningData.content }}
              />
            </div>
          </div>

          {/* Solicitud de mejora */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              ¿Qué quieres que el AI mejore o amplíe?
            </h3>
            
            <textarea
              value={enhancementRequest}
              onChange={(e) => setEnhancementRequest(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical text-sm"
              placeholder="Ejemplo:
• Amplía la sección de mejores prácticas
• Agrega más ejemplos prácticos
• Incluye casos de uso específicos para mi industria
• Mejora la explicación técnica
• Añade troubleshooting común
• Estructura mejor el contenido
• Incluye recursos adicionales y referencias"
              rows={4}
            />
            
            <div className="mt-3 text-xs sm:text-sm text-purple-700 bg-purple-100 p-2 sm:p-3 rounded-md">
              <strong>💡 Consejos:</strong>
              <ul className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 list-disc list-inside text-xs sm:text-sm">
                <li>Sé específico sobre qué aspectos quieres mejorar</li>
                <li>Menciona tu contexto o industria si es relevante</li>
                <li>Indica si necesitas más ejemplos, teoria o práctica</li>
                <li>Pide formato específico si tienes preferencias</li>
              </ul>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnhance}
              disabled={isProcessing || !enhancementRequest.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white order-1 sm:order-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Procesando con AI...</span>
                  <span className="sm:hidden">Procesando...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Mejorar con AI</span>
                  <span className="sm:hidden">Mejorar</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningAIEnhancementModal;