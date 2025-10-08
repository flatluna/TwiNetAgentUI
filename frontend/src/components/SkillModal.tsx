import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Sparkles,
  Target,
  Award,
  Clock,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { SkillData } from '@/services/skillsApiService';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: Omit<SkillData, 'id' | 'dateAdded' | 'lastUpdated'>) => Promise<void>;
  skill?: SkillData | null;
  categories: string[];
}

const skillLevels = [
  { value: 'Principiante', color: 'bg-red-100 text-red-800', stars: 1 },
  { value: 'Intermedio', color: 'bg-yellow-100 text-yellow-800', stars: 2 },
  { value: 'Avanzado', color: 'bg-blue-100 text-blue-800', stars: 3 },
  { value: 'Experto', color: 'bg-green-100 text-green-800', stars: 4 }
];

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  skill,
  categories
}) => {
  const [formData, setFormData] = useState<Partial<SkillData>>({
    name: '',
    category: '',
    level: 'Principiante',
    description: '',
    experienceYears: 0,
    certifications: [],
    projects: [],
    learningPath: [],
    tags: [],
    validated: false
  });

  const [newCertification, setNewCertification] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newTag, setNewTag] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (skill) {
      setFormData(skill);
    } else {
      setFormData({
        name: '',
        category: '',
        level: 'Principiante',
        description: '',
        experienceYears: 0,
        certifications: [],
        projects: [],
        learningPath: [],
        tags: [],
        validated: false
      });
    }
    // Reset saving state and errors when modal opens/closes or skill changes
    setSaving(false);
    setErrors({});
    // NO resetear showSuccess aquí para que se mantenga visible después de actualizar
  }, [skill, isOpen]);

  // Separar useEffect para limpiar showSuccess después de un tiempo
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // Ocultar mensaje de éxito después de 3 segundos

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validar nombre (requerido)
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    // Validar categoría (requerida)
    if (!formData.category?.trim()) {
      newErrors.category = 'La categoría es requerida';
    }
    
    // Validar años de experiencia (debe ser >= 0)
    if (formData.experienceYears === undefined || formData.experienceYears < 0) {
      newErrors.experienceYears = 'Los años de experiencia son requeridos y deben ser 0 o mayor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (saving) return;
    
    // Limpiar mensajes previos
    setErrors({});
    setShowSuccess(false);
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const skillToSave: Omit<SkillData, 'id' | 'dateAdded' | 'lastUpdated'> = {
        name: formData.name?.trim() || '',
        category: formData.category?.trim() || '',
        level: formData.level || 'Principiante',
        description: formData.description?.trim() || '',
        experienceYears: formData.experienceYears || 0,
        certifications: formData.certifications || [],
        projects: formData.projects || [],
        learningPath: formData.learningPath || [],
        aiSuggestions: formData.aiSuggestions || [],
        tags: formData.tags || [],
        validated: formData.validated || false
      };

      await onSave(skillToSave);
      
      // Mostrar mensaje de éxito y NO cerrar el modal
      setShowSuccess(true);
      
      // Solo limpiar formulario si es una NUEVA habilidad (no edición)
      // En edición, mantener los valores actuales que el usuario editó
      if (!skill) {
        // Crear nueva habilidad - limpiar formulario para la siguiente
        setFormData({
          name: '',
          category: '',
          level: 'Principiante',
          description: '',
          experienceYears: 0,
          certifications: [],
          projects: [],
          learningPath: [],
          tags: [],
          validated: false
        });
      }
      // Si es edición (skill existe), NO tocar formData - mantener valores editados
      
    } catch (error) {
      console.error('Error saving skill:', error);
      setErrors({ general: 'Error al guardar la habilidad. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const addProject = () => {
    if (newProject.trim()) {
      setFormData(prev => ({
        ...prev,
        projects: [...(prev.projects || []), newProject.trim()]
      }));
      setNewProject('');
    }
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAIEnhancement = async () => {
    setAiSuggesting(true);
    // Simular llamada a IA
    setTimeout(() => {
      const suggestions = [
        `Para mejorar en ${formData.name}, considera especializarte en tecnologías emergentes`,
        `La certificación en este campo puede aumentar tu valor profesional`,
        `Documenta tus proyectos para crear un portafolio sólido`
      ];
      
      setFormData(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));
      setAiSuggesting(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {skill ? 'Editar Habilidad' : 'Nueva Habilidad'}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mensajes de Error y Éxito */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Errores de validación:</span>
            </div>
            <ul className="mt-2 text-sm text-red-700">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field} className="ml-6">• {message}</li>
              ))}
            </ul>
          </div>
        )}

        {showSuccess && (
          <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">
                {skill ? 'Habilidad actualizada exitosamente' : 'Habilidad creada exitosamente'}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Habilidad *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. Plomería Residencial, Contabilidad Fiscal..."
                    className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel de Dominio *
                  </label>
                  <Select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                  >
                    {skillLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.value}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Años de Experiencia *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                    className={errors.experienceYears ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu experiencia y conocimiento en esta área..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Certificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Certificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Nombre de la certificación..."
                    onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  />
                  <Button onClick={addCertification} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications?.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{cert}</span>
                      <button
                        onClick={() => removeCertification(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proyectos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Proyectos Relevantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    placeholder="Nombre del proyecto..."
                    onKeyPress={(e) => e.key === 'Enter' && addProject()}
                  />
                  <Button onClick={addProject} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.projects?.map((project, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{project}</span>
                      <button
                        onClick={() => removeProject(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Etiquetas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Etiqueta..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IA Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Mejoras con IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAIEnhancement}
                disabled={aiSuggesting}
                className="mb-4"
              >
                {aiSuggesting ? 'Generando sugerencias...' : 'Obtener Sugerencias IA'}
              </Button>
              {formData.aiSuggestions && formData.aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  {formData.aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="w-4 h-4 mr-2" />
            Cerrar Modal
          </Button>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {skill ? 'Actualizar' : 'Guardar'} Habilidad
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillModal;